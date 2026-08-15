from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import ProjectStatus


class ProjectCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=255,
    )

    objective: str = Field(
        min_length=1,
    )

    description: str = Field(
        min_length=1,
    )

    deadline: datetime | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    objective: str | None = Field(
        default=None,
        min_length=1,
    )

    description: str | None = Field(
        default=None,
        min_length=1,
    )

    status: ProjectStatus | None = None

    deadline: datetime | None = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    objective: str
    description: str
    status: ProjectStatus
    deadline: datetime | None
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }