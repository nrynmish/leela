from pydantic import BaseModel, EmailStr, Field

from app.core.enums import UserRole


class UserCreate(BaseModel):
    roll_no: str = Field(min_length=1, max_length=50)

    email: EmailStr

    full_name: str = Field(min_length=1, max_length=255)

    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    roll_no: str

    password: str


class UserResponse(BaseModel):
    id: int

    roll_no: str

    email: EmailStr

    full_name: str

    role: UserRole

    model_config = {
        "from_attributes": True,
    }


class TokenResponse(BaseModel):
    access_token: str

    refresh_token: str

    token_type: str = "bearer"