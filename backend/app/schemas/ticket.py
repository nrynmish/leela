from datetime import datetime
from typing import Literal

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

    deadline: datetime | None = None

    drive_link_required: bool = False


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

    deadline: datetime | None = None

    drive_link_required: bool | None = None

    reason: str | None = None


class BulkTicketCreate(BaseModel):
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

    assignee_ids: list[int] = Field(
        min_length=1,
    )

    assignment_mode: Literal["individual", "common"] = "individual"

    deadline: datetime | None = None

    drive_link_required: bool = False


class ReviewSubmission(BaseModel):
    drive_link: str | None = None


class ReviewDecision(BaseModel):
    decision: Literal["approve", "request_changes"]
    feedback: str | None = None
    drive_link: str | None = None


class DeadlineUpdate(BaseModel):
    deadline: datetime | None = None
    reason: str | None = None


class AssigneeResponse(BaseModel):
    id: int
    name: str
    initials: str

    model_config = {
        "from_attributes": True,
    }


class DeadlineHistoryResponse(BaseModel):
    id: int
    ticket_id: int
    previous_deadline: datetime | None = None
    new_deadline: datetime | None = None
    changed_by: int | None = None
    changed_at: datetime
    reason: str | None = None

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
    assignees: list[AssigneeResponse] = Field(default_factory=list)
    deadline: datetime | None = None
    drive_link_required: bool = False
    drive_link: str | None = None
    submitted_by: int | None = None
    submitted_at: datetime | None = None
    review_feedback: str | None = None
    deadline_history: list[DeadlineHistoryResponse] = Field(default_factory=list)
    created_by: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class BulkTicketCreateResponse(BaseModel):
    created_count: int
    assignment_mode: Literal["individual", "common"]
    tickets: list[TicketResponse]