from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_roles
from app.core.enums import UserRole, UserStatus
from app.db.database import get_db
from app.models.project import Project
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.admin import UserRoleUpdate
from app.schemas.user import UserResponse

router = APIRouter(
    prefix="/admin/users",
    tags=["Admin Users"],
)


@router.get(
    "",
    response_model=list[UserResponse],
)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    ),
):
    return db.scalars(
        select(User).order_by(User.id.asc())
    ).all()


@router.patch(
    "/{user_id}/role",
    response_model=UserResponse,
)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    ),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Do not allow an admin to accidentally remove
    # their own administrative access.
    if (
        user.id == current_user.id
        and payload.role != UserRole.ADMIN
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own admin access",
        )

    if payload.role == UserRole.HEAD:
        department = (
            payload.department.strip()
            if payload.department
            else ""
        )

        if not department:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department is required for a Head",
            )

        user.department = department

    user.role = payload.role

    # A user whose role is changed by an admin must
    # be approved and therefore able to log in.
    user.status = UserStatus.APPROVED

    db.commit()
    db.refresh(user)

    return user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    ),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )

    project_ids = db.scalars(
        select(Project.id).where(
            Project.created_by == user_id,
        )
    ).all()

    assigned_tickets = db.scalars(
        select(Ticket).where(
            Ticket.assignee_id == user_id,
        )
    ).all()

    for ticket in assigned_tickets:
        ticket.assignee_id = None

    tickets_to_delete = set()

    for ticket in db.scalars(
        select(Ticket).where(
            Ticket.created_by == user_id,
        )
    ).all():
        tickets_to_delete.add(ticket.id)

    if project_ids:
        for ticket in db.scalars(
            select(Ticket).where(
                Ticket.project_id.in_(project_ids),
            )
        ).all():
            tickets_to_delete.add(ticket.id)

    for ticket_id in sorted(tickets_to_delete):
        ticket = db.get(Ticket, ticket_id)
        if ticket is not None:
            db.delete(ticket)

    for project_id in project_ids:
        project = db.get(Project, project_id)
        if project is not None:
            db.delete(project)

    db.delete(user)
    db.commit()
