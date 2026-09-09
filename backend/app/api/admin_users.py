from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_roles
from app.core.enums import UserRole, UserStatus
from app.db.database import get_db
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
