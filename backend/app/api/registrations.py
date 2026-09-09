from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, require_roles
from app.core.enums import UserRole, UserStatus
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse


router = APIRouter(
    prefix="/admin/registrations",
    tags=["Registrations"],
)


@router.get(
    "",
    response_model=list[UserResponse],
)
def list_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    ),
):
    return db.scalars(
        select(User)
        .where(User.status == UserStatus.PENDING)
        .order_by(User.id.asc())
    ).all()


@router.patch(
    "/{user_id}/approve",
    response_model=UserResponse,
)
def approve_registration(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    ),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.status = UserStatus.APPROVED

    db.commit()
    db.refresh(user)

    return user


@router.patch(
    "/{user_id}/reject",
    response_model=UserResponse,
)
def reject_registration(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN)
    ),
):
    user = db.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.status = UserStatus.REJECTED

    db.commit()
    db.refresh(user)

    return user