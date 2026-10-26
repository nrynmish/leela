from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from sqlalchemy import update as sqlalchemy_update

from app.api.dependencies import get_current_user
from app.core.enums import TicketStatus, UserRole, UserStatus
from app.db.database import get_db
from app.models.ticket import Ticket, TicketAssignee, TicketDeadlineHistory
from app.models.project import Project
from app.models.user import User
from app.schemas.ticket import (
    BulkTicketCreate,
    BulkTicketCreateResponse,
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    AssigneeResponse,
    DeadlineHistoryResponse,
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

    deadline_history = [
        DeadlineHistoryResponse(
            id=row.id,
            ticket_id=row.ticket_id,
            previous_deadline=row.previous_deadline,
            new_deadline=row.new_deadline,
            changed_by=row.changed_by,
            changed_at=row.changed_at,
            reason=row.reason,
        )
        for row in sorted(
            ticket.deadline_history,
            key=lambda item: item.changed_at,
            reverse=True,
        )
    ]

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
        deadline=ticket.deadline,
        drive_link_required=ticket.drive_link_required,
        drive_link=ticket.drive_link,
        submitted_by=ticket.submitted_by,
        submitted_at=ticket.submitted_at,
        review_feedback=ticket.review_feedback,
        deadline_history=deadline_history,
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


IST = timezone(timedelta(hours=5, minutes=30))


def normalize_deadline(value: datetime | None) -> datetime | None:
    if value is None:
        return None

    if value.tzinfo is None:
        value = value.replace(tzinfo=IST)
    else:
        value = value.astimezone(IST)

    return value.astimezone(timezone.utc)


def validate_drive_link(link: str | None) -> str | None:
    if link is None or link.strip() == "":
        return None

    candidate = link.strip()
    parsed = urlparse(candidate)
    hostname = (parsed.hostname or "").lower()
    allowed_hosts = {
        "drive.google.com",
        "www.drive.google.com",
    }

    if parsed.scheme != "https" or hostname not in allowed_hosts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Drive links must use https://drive.google.com",
        )

    if not parsed.path or parsed.path == "/":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Drive link is invalid",
        )

    return candidate


def ensure_ticket_status_for_assignee_change(ticket: Ticket, assignee_count: int) -> None:
    if ticket.status in {TicketStatus.REVIEW, TicketStatus.DONE, TicketStatus.BACKLOG}:
        return

    if assignee_count > 0:
        ticket.status = TicketStatus.IN_PROGRESS
    elif ticket.status != TicketStatus.REVIEW and ticket.status != TicketStatus.DONE:
        ticket.status = TicketStatus.TODO


def determine_initial_ticket_status(status: TicketStatus, assignee_count: int) -> TicketStatus:
    if status != TicketStatus.BACKLOG:
        return status
    if assignee_count == 0:
        return TicketStatus.TODO
    return TicketStatus.IN_PROGRESS


def record_deadline_change(
    db: Session,
    ticket: Ticket,
    previous_deadline: datetime | None,
    new_deadline: datetime | None,
    changed_by: int,
    reason: str | None = None,
) -> None:
    if previous_deadline == new_deadline:
        return

    db.add(
        TicketDeadlineHistory(
            ticket_id=ticket.id,
            previous_deadline=previous_deadline,
            new_deadline=new_deadline,
            changed_by=changed_by,
            changed_at=datetime.now(timezone.utc),
            reason=reason,
        )
    )


def can_review_ticket(
    ticket: Ticket,
    current_user: User,
    db: Session,
) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True

    assignee_ids = {ticket.assignee_id} if ticket.assignee_id is not None else set()
    assignee_ids |= {
        row
        for row, in db.execute(
            select(TicketAssignee.user_id).where(
                TicketAssignee.ticket_id == ticket.id,
            )
        ).all()
    }

    if current_user.role == UserRole.MEMBER:
        return current_user.id in assignee_ids

    if current_user.role == UserRole.HEAD:
        if ticket.created_by == current_user.id:
            return True
        if current_user.id in assignee_ids:
            return True
        if any(
            assignee_id is not None
            and db.get(User, assignee_id) is not None
            and db.get(User, assignee_id).department == current_user.department
            for assignee_id in assignee_ids
        ):
            return True

    return False


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

    normalized_deadline = normalize_deadline(payload.deadline)
    if normalized_deadline is not None and normalized_deadline <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deadline must be in the future",
        )

    if payload.assignee_id is not None:
        assignee = db.get(User, payload.assignee_id)
        if not assignee:
            raise HTTPException(404, "Assignee not found")
        if assignee.status != UserStatus.APPROVED:
            raise HTTPException(403, "Assignee is not approved")
        if not can_assign(current_user, assignee):
            raise HTTPException(403, "You cannot assign tickets to this user")

    ticket = Ticket(
        key=next_ticket_key(db),
        title=payload.title,
        summary=payload.summary,
        status=determine_initial_ticket_status(payload.status, 1 if payload.assignee_id is not None else 0),
        priority=payload.priority,
        labels=", ".join(payload.labels),
        project_id=payload.project_id,
        assignee_id=payload.assignee_id,
        deadline=normalized_deadline,
        drive_link_required=payload.drive_link_required,
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

    normalized_deadline = normalize_deadline(payload.deadline)
    if normalized_deadline is not None and normalized_deadline <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deadline must be in the future",
        )

    created_tickets = []

    try:
        if payload.assignment_mode == "individual":
            for assignee in assignees:
                ticket = Ticket(
                    key=next_ticket_key(db),
                    title=payload.title,
                    summary=payload.summary,
                    status=determine_initial_ticket_status(payload.status, 1),
                    priority=payload.priority,
                    labels=", ".join(payload.labels),
                    project_id=payload.project_id,
                    assignee_id=assignee.id,
                    deadline=normalized_deadline,
                    drive_link_required=payload.drive_link_required,
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
                status=determine_initial_ticket_status(payload.status, len(assignees)),
                priority=payload.priority,
                labels=", ".join(payload.labels),
                project_id=payload.project_id,
                assignee_id=assignees[0].id,
                deadline=normalized_deadline,
                drive_link_required=payload.drive_link_required,
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

        if assignee.status != UserStatus.APPROVED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Assignee is not approved",
            )

        if not can_assign(current_user, assignee):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot assign tickets to this user",
            )

    previous_deadline = ticket.deadline

    if "deadline" in updates:
        normalized_deadline = normalize_deadline(updates["deadline"])
        if normalized_deadline is not None and normalized_deadline <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Deadline must be in the future",
            )
        updates["deadline"] = normalized_deadline

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

    if "assignee_id" in updates:
        assignee_count = len(get_ticket_assignments(db, ticket.id))
        ensure_ticket_status_for_assignee_change(ticket, assignee_count)

    if "deadline" in updates:
        record_deadline_change(
            db,
            ticket,
            previous_deadline,
            ticket.deadline,
            current_user.id,
            updates.get("reason"),
        )

    db.commit()
    db.refresh(ticket)

    return serialize_ticket(
        ticket,
        db,
    )


@router.post(
    "/{ticket_id}/submit-review",
    response_model=TicketResponse,
)
def submit_ticket_for_review(
    ticket_id: int,
    payload: dict | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.execute(
        select(Ticket)
        .where(Ticket.id == ticket_id)
        .with_for_update()
    ).scalar_one_or_none()
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    if not can_view_ticket(ticket, current_user, db):
        raise HTTPException(403, "You do not have permission to access this ticket")

    assignee_ids = {ticket.assignee_id} if ticket.assignee_id is not None else set()
    assignee_ids |= {
        user_id
        for user_id, in db.execute(
            select(TicketAssignee.user_id).where(
                TicketAssignee.ticket_id == ticket.id,
            )
        ).all()
    }

    if current_user.role == UserRole.MEMBER and current_user.id not in assignee_ids:
        raise HTTPException(403, "Only assigned members can submit this ticket for review")

    if current_user.role == UserRole.HEAD and ticket.created_by != current_user.id and current_user.id not in assignee_ids:
        raise HTTPException(403, "Only the ticket creator or assignee can submit for review")

    if ticket.status in {TicketStatus.REVIEW, TicketStatus.DONE}:
        raise HTTPException(400, "Ticket is already in a terminal review state")

    candidate_link = None
    if payload is not None:
        candidate_link = payload.get("drive_link")

    if ticket.drive_link_required:
        candidate_link = validate_drive_link(candidate_link)
        if candidate_link is None:
            raise HTTPException(400, "A valid Google Drive link is required before submission")

    now = datetime.now(timezone.utc)
    result = db.execute(
        sqlalchemy_update(Ticket)
        .where(
            Ticket.id == ticket.id,
            Ticket.status.in_({TicketStatus.TODO, TicketStatus.IN_PROGRESS, TicketStatus.BACKLOG}),
            Ticket.submitted_at.is_(None),
        )
        .values(
            status=TicketStatus.REVIEW,
            submitted_by=current_user.id,
            submitted_at=now,
            drive_link=candidate_link,
            review_feedback=None,
        )
    )

    if result.rowcount != 1:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ticket state changed while submitting for review",
        )

    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket, db)


@router.post(
    "/{ticket_id}/review",
    response_model=TicketResponse,
)
def review_ticket(
    ticket_id: int,
    payload: dict | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    if ticket.status != TicketStatus.REVIEW:
        raise HTTPException(400, "Ticket is not awaiting review")
    if not can_review_ticket(ticket, current_user, db):
        raise HTTPException(403, "You are not authorized to review this ticket")

    decision = (payload or {}).get("decision")
    feedback = (payload or {}).get("feedback")
    drive_link = (payload or {}).get("drive_link")

    if decision not in {"approve", "request_changes"}:
        raise HTTPException(400, "Review decision must be approve or request_changes")

    if decision == "approve":
        ticket.status = TicketStatus.DONE
        ticket.review_feedback = feedback
    else:
        ticket.status = TicketStatus.IN_PROGRESS
        ticket.review_feedback = feedback or ticket.review_feedback
        ticket.submitted_by = None
        ticket.submitted_at = None

    if drive_link is not None and drive_link.strip():
        ticket.drive_link = validate_drive_link(drive_link)
    if ticket.drive_link_required and decision == "approve" and ticket.drive_link is None:
        raise HTTPException(400, "A valid Google Drive link is required for approval")

    ticket.last_reviewed_by = current_user.id
    ticket.last_reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket, db)


@router.patch(
    "/{ticket_id}/deadline",
    response_model=TicketResponse,
)
def update_ticket_deadline(
    ticket_id: int,
    payload: dict | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")

    if current_user.role not in (UserRole.ADMIN, UserRole.HEAD):
        raise HTTPException(403, "Only admins and heads can update deadlines")

    if current_user.role == UserRole.HEAD and ticket.created_by != current_user.id:
        raise HTTPException(403, "Heads can only update deadlines on tickets they created")

    values = payload or {}
    previous_deadline = ticket.deadline
    next_deadline = normalize_deadline(values.get("deadline")) if values.get("deadline") is not None else None
    if next_deadline is not None and next_deadline <= datetime.now(timezone.utc):
        raise HTTPException(400, "Deadline must be in the future")

    ticket.deadline = next_deadline
    record_deadline_change(
        db,
        ticket,
        previous_deadline,
        ticket.deadline,
        current_user.id,
        values.get("reason"),
    )

    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket, db)


def expire_overdue_tickets(db: Session, now: datetime | None = None) -> list[Ticket]:
    current_time = now or datetime.now(timezone.utc)

    eligible_ids = db.execute(
        select(Ticket.id)
        .where(
            Ticket.deadline.is_not(None),
            Ticket.deadline <= current_time,
            Ticket.status.in_({TicketStatus.TODO, TicketStatus.IN_PROGRESS}),
            Ticket.submitted_at.is_(None),
        )
        .with_for_update()
    ).scalars().all()

    if not eligible_ids:
        return []

    result = db.execute(
        sqlalchemy_update(Ticket)
        .where(
            Ticket.id.in_(eligible_ids),
            Ticket.deadline.is_not(None),
            Ticket.deadline <= current_time,
            Ticket.status.in_({TicketStatus.TODO, TicketStatus.IN_PROGRESS}),
            Ticket.submitted_at.is_(None),
        )
        .values(status=TicketStatus.BACKLOG)
    )

    if result.rowcount == 0:
        return []

    expired_tickets = db.execute(
        select(Ticket)
        .where(
            Ticket.id.in_(eligible_ids),
            Ticket.status == TicketStatus.BACKLOG,
            Ticket.deadline.is_not(None),
            Ticket.deadline <= current_time,
            Ticket.submitted_at.is_(None),
        )
    ).scalars().all()

    db.commit()
    return expired_tickets


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
