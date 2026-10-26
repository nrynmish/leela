from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.enums import UserRole, UserStatus
from app.db.database import get_db
from app.models.ticket import Ticket, TicketAssignee
from app.models.project import Project
from app.models.user import User
from app.schemas.ticket import (
    BulkTicketCreate,
    BulkTicketCreateResponse,
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    AssigneeResponse,
)


router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"],
)


def build_assignee_response(user: User | None) -> AssigneeResponse | None:
    if not user:
        return None

    initials = "".join(
        part[0]
        for part in user.full_name.split()
        if part
    )[:2].upper()

    return AssigneeResponse(
        id=user.id,
        name=user.full_name,
        initials=initials,
    )


def get_ticket_assignments(db: Session, ticket_id: int) -> list[User]:
    assignment_rows = db.scalars(
        select(TicketAssignee.user_id).where(
            TicketAssignee.ticket_id == ticket_id,
        )
    ).all()

    ids = list(dict.fromkeys(assignment_rows))
    if not ids:
        assignee_id = db.scalar(
            select(Ticket.assignee_id).where(
                Ticket.id == ticket_id,
            )
        )
        if assignee_id is not None:
            ids = [assignee_id]

    if not ids:
        return []

    return db.scalars(
        select(User).where(User.id.in_(ids))
    ).all()


def serialize_ticket(
    ticket: Ticket,
    db: Session,
) -> TicketResponse:
    assignee = None
    assignees = []

    assigned_users = get_ticket_assignments(db, ticket.id)
    for user in assigned_users:
        assignee_response = build_assignee_response(user)
        if assignee_response is not None:
            assignees.append(assignee_response)

    if assignees:
        assignee = assignees[0]
    elif ticket.assignee_id:
        assignee = build_assignee_response(
            db.get(User, ticket.assignee_id)
        )

    return TicketResponse(
        id=ticket.id,
        key=ticket.key,
        title=ticket.title,
        summary=ticket.summary,
        status=ticket.status,
        priority=ticket.priority,
        labels=[
            label.strip()
            for label in ticket.labels.split(",")
            if label.strip()
        ],
        project_id=ticket.project_id,
        assignee=assignee,
        assignees=assignees,
        created_by=ticket.created_by,
        created_at=ticket.created_at,
        updated_at=ticket.updated_at,
    )


def next_ticket_key(db: Session) -> str:
    tickets = db.scalars(
        select(Ticket)
    ).all()

    max_number = 0

    for ticket in tickets:
        try:
            number = int(
                ticket.key.split("-")[-1]
            )
            max_number = max(
                max_number,
                number,
            )
        except (ValueError, IndexError):
            continue

    return f"LEL-{max_number + 1:03d}"

def can_assign(assigner: User, assignee: User) -> bool:
    if assignee.status != UserStatus.APPROVED:
        return False

    if assigner.role == UserRole.ADMIN:
        return assignee.role in (UserRole.HEAD, UserRole.MEMBER)
    if assigner.role == UserRole.HEAD:
        return (
            assignee.role == UserRole.MEMBER
            and assignee.department == assigner.department
        )
    return False


def can_view_ticket(
    ticket: Ticket,
    current_user: User,
    db: Session,
) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True

    assignee_ids = {ticket.assignee_id} if ticket.assignee_id is not None else set()
    assignee_ids |= {
        user_id
        for user_id, in db.execute(
            select(TicketAssignee.user_id).where(
                TicketAssignee.ticket_id == ticket.id,
            )
        ).all()
    }

    if current_user.role == UserRole.MEMBER:
        return current_user.id in assignee_ids

    if current_user.role == UserRole.HEAD:
        if current_user.id in assignee_ids:
            return True

        if ticket.created_by == current_user.id:
            return True

        if any(
            assignee_id is not None
            and db.get(User, assignee_id) is not None
            and db.get(User, assignee_id).department == current_user.department
            for assignee_id in assignee_ids
        ):
            return True

        return False

    return False

@router.get(
    "",
    response_model=list[TicketResponse],
)
def get_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tickets = db.scalars(
        select(Ticket)
        .order_by(Ticket.created_at.desc())
    ).all()

    visible_tickets = [
        ticket
        for ticket in tickets
        if can_view_ticket(
            ticket,
            current_user,
            db,
        )
    ]

    return [
        serialize_ticket(ticket, db)
        for ticket in visible_tickets
    ]


@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.get(
        Ticket,
        ticket_id,
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    if not can_view_ticket(
        ticket,
        current_user,
        db,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this ticket",
        )

    return serialize_ticket(
        ticket,
        db,
    )


def validate_assignee_ids(
    db: Session,
    current_user: User,
    assignee_ids: list[int],
) -> list[User]:
    if not assignee_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one assignee is required",
        )

    unique_ids = []
    seen = set()

    for assignee_id in assignee_ids:
        if assignee_id in seen:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Duplicate assignee IDs are not allowed",
            )
        seen.add(assignee_id)

        assignee = db.get(User, assignee_id)
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assignee not found: {assignee_id}",
            )

        if assignee.status != UserStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User is not approved for assignment: {assignee_id}",
            )

        if not can_assign(current_user, assignee):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You cannot assign tickets to this user: {assignee_id}",
            )

        unique_ids.append(assignee)

    return unique_ids


@router.post(
    "",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (
        UserRole.ADMIN,
        UserRole.HEAD,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create tickets",
        )

    project = db.get(
        Project,
        payload.project_id,
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    if payload.assignee_id is not None:
        assignee = db.get(User, payload.assignee_id)
        if not assignee:
            raise HTTPException(404, "Assignee not found")
        if not can_assign(current_user, assignee):
            raise HTTPException(403, "You cannot assign tickets to this user")

    ticket = Ticket(
        key=next_ticket_key(db),
        title=payload.title,
        summary=payload.summary,
        status=payload.status,
        priority=payload.priority,
        labels=", ".join(payload.labels),
        project_id=payload.project_id,
        assignee_id=payload.assignee_id,
        created_by=current_user.id,
    )

    if payload.assignee_id is not None:
        db.add(ticket)
        db.commit()
        db.refresh(ticket)
        db.add(
            TicketAssignee(
                ticket_id=ticket.id,
                user_id=payload.assignee_id,
            )
        )
        db.commit()
        return serialize_ticket(ticket, db)

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return serialize_ticket(
        ticket,
        db,
    )


@router.post(
    "/bulk",
    response_model=BulkTicketCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_bulk_tickets(
    payload: BulkTicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (
        UserRole.ADMIN,
        UserRole.HEAD,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create tickets",
        )

    project = db.get(Project, payload.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    assignees = validate_assignee_ids(
        db,
        current_user,
        payload.assignee_ids,
    )

    created_tickets = []

    try:
        if payload.assignment_mode == "individual":
            for assignee in assignees:
                ticket = Ticket(
                    key=next_ticket_key(db),
                    title=payload.title,
                    summary=payload.summary,
                    status=payload.status,
                    priority=payload.priority,
                    labels=", ".join(payload.labels),
                    project_id=payload.project_id,
                    assignee_id=assignee.id,
                    created_by=current_user.id,
                )
                db.add(ticket)
                db.flush()
                db.add(
                    TicketAssignee(
                        ticket_id=ticket.id,
                        user_id=assignee.id,
                    )
                )
                created_tickets.append(ticket)

            db.commit()
        else:
            ticket = Ticket(
                key=next_ticket_key(db),
                title=payload.title,
                summary=payload.summary,
                status=payload.status,
                priority=payload.priority,
                labels=", ".join(payload.labels),
                project_id=payload.project_id,
                assignee_id=assignees[0].id,
                created_by=current_user.id,
            )
            db.add(ticket)
            db.flush()

            for assignee in assignees:
                db.add(
                    TicketAssignee(
                        ticket_id=ticket.id,
                        user_id=assignee.id,
                    )
                )

            db.commit()
            created_tickets = [ticket]
    except Exception:
        db.rollback()
        raise

    serialized = [serialize_ticket(ticket, db) for ticket in created_tickets]
    return BulkTicketCreateResponse(
        created_count=len(serialized),
        assignment_mode=payload.assignment_mode,
        tickets=serialized,
    )


@router.patch(
    "/{ticket_id}",
    response_model=TicketResponse,
)
def update_ticket(
    ticket_id: int,
    payload: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.get(
        Ticket,
        ticket_id,
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    if not can_view_ticket(
        ticket,
        current_user,
        db,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this ticket",
        )

    # Members cannot modify tickets.
    if current_user.role == UserRole.MEMBER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Members cannot edit tickets",
        )

    # Heads can only edit tickets they created.
    if (
        current_user.role == UserRole.HEAD
        and ticket.created_by != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Heads can only edit tickets they created",
        )

    updates = payload.model_dump(
        exclude_unset=True
    )

    if (
        "status" in updates
        and current_user.role != UserRole.ADMIN
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change ticket status",
        )

    if "project_id" in updates:
        project = db.get(
            Project,
            updates["project_id"],
        )

        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found",
            )

    if (
        "assignee_id" in updates
        and updates["assignee_id"] is not None
    ):
        assignee = db.get(
            User,
            updates["assignee_id"],
        )

        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignee not found",
            )

        if not can_assign(current_user, assignee):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail = "You cannot assign tickets to this user"
            )

    if "labels" in updates:
        updates["labels"] = ", ".join(
            updates["labels"]
        )

    for field, value in updates.items():
        setattr(
            ticket,
            field,
            value,
        )

    db.commit()
    db.refresh(ticket)

    return serialize_ticket(
        ticket,
        db,
    )


@router.delete(
    "/{ticket_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.get(
        Ticket,
        ticket_id,
    )

    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    if current_user.role == UserRole.MEMBER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Members cannot delete tickets",
        )

    if not can_view_ticket(
        ticket,
        current_user,
        db,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this ticket",
        )

    if current_user.role == UserRole.HEAD:
        if ticket.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Heads can only delete tickets they created",
            )

    try:
        db.execute(
            delete(TicketAssignee).where(
                TicketAssignee.ticket_id == ticket_id,
            )
        )
        db.delete(ticket)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete ticket",
        )
