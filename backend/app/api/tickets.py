from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.enums import UserRole
from app.db.database import get_db
from app.models.ticket import Ticket
from app.models.project import Project
from app.models.user import User
from app.schemas.ticket import (
    TicketCreate,
    TicketUpdate,
    TicketResponse,
    AssigneeResponse,
)


router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"],
)


def serialize_ticket(
    ticket: Ticket,
    db: Session,
) -> TicketResponse:
    assignee = None

    if ticket.assignee_id:
        user = db.get(
            User,
            ticket.assignee_id,
        )

        if user:
            initials = "".join(
                part[0]
                for part in user.full_name.split()
                if part
            )[:2].upper()

            assignee = AssigneeResponse(
                id=user.id,
                name=user.full_name,
                initials=initials,
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


@router.get(
    "",
    response_model=list[TicketResponse],
)
def get_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tickets = db.scalars(
        select(Ticket).order_by(
            Ticket.created_at.desc()
        )
    ).all()

    return [
        serialize_ticket(ticket, db)
        for ticket in tickets
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

    return serialize_ticket(
        ticket,
        db,
    )


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
        assignee = db.get(
            User,
            payload.assignee_id,
        )

        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assignee not found",
            )

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

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return serialize_ticket(
        ticket,
        db,
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

    # Members cannot delete tickets.
    if current_user.role == UserRole.MEMBER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Members cannot delete tickets",
        )

    # Heads can delete:
    # 1. their own tickets
    # 2. tickets created by another Head
    if current_user.role == UserRole.HEAD:
        if ticket.created_by == current_user.id:
            db.delete(ticket)
            db.commit()
            return

        creator = db.get(
            User,
            ticket.created_by,
        )

        if not creator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket creator not found",
            )

        if creator.role != UserRole.HEAD:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Heads can only delete tickets created by Heads",
            )

    # Admins can delete any ticket.
    if current_user.role == UserRole.ADMIN:
        db.delete(ticket)
        db.commit()
        return

    db.delete(ticket)
    db.commit()