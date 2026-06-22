from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi import APIRouter, Depends, HTTPException, status

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.security import hash_password

from app.schemas.user import (
    UserCreate,
    UserResponse,
    UserLogin,
    TokenResponse,
)

from app.services.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
):
    existing_roll = db.scalar(
        select(User).where(
            User.roll_no == payload.roll_no
        )
    )

    if existing_roll:
        raise HTTPException(
            status_code=400,
            detail="Roll number already exists",
        )

    existing_email = db.scalar(
        select(User).where(
            User.email == payload.email
        )
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    user = User(
        roll_no=payload.roll_no,
        email=payload.email,
        full_name=payload.full_name,
        password_hash=hash_password(
            payload.password
        ),
    )


    db.add(user)

    db.commit()

    db.refresh(user)

    return user

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    payload: UserLogin,
    db: Session = Depends(get_db),
):
    user = db.scalar(
        select(User).where(
            User.roll_no == payload.roll_no
        )
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(
        payload.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    access_token = create_access_token(
        str(user.id)
    )

    refresh_token = create_refresh_token(
        str(user.id)
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )