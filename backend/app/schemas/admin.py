from pydantic import BaseModel, Field

from app.core.enums import UserRole


class UserRoleUpdate(BaseModel):
    role: UserRole
    department: str | None = None


class UserDepartmentUpdate(BaseModel):
    department: str = Field(min_length=1, max_length=100)
