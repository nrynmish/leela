from pydantic import BaseModel

from app.core.enums import UserRole


class UserRoleUpdate(BaseModel):
    role: UserRole
    department: str | None = None
