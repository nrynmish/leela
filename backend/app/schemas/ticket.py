from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import TicketPriority, TicketStatus


class TicketCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=255,
    )

    summary: str = Field(
        min_length=1,
    )

    status: TicketStatus = TicketStatus.BACKLOG

    priority: TicketPriority = TicketPriority.MEDIUM

    labels: list[str] = Field(
        default_factory=list,
    )

    project_id: int

    assignee_id: int | None = None


class TicketUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    summary: str | None = Field(
        default=None,
        min_length=1,
    )

    status: TicketStatus | None = None

    priority: TicketPriority | None = None

    labels: list[str] | None = None

    project_id: int | None = None

    assignee_id: int | None = None


class AssigneeResponse(BaseModel):
    id: int
    name: str
    initials: str

    model_config = {
        "from_attributes": True,
    }


class TicketResponse(BaseModel):
    id: int
    key: str
    title: str
    summary: str
    status: TicketStatus
    priority: TicketPriority
    labels: list[str]
    project_id: int
    assignee: AssigneeResponse | None
    created_by: int
    created_at: datetime
    updated_at: datetime