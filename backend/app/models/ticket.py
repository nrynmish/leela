from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
    Enum as SqlEnum,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import TicketPriority, TicketStatus
from app.db.database import Base


class TicketAssignee(Base):
    __tablename__ = "ticket_assignees"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    ticket_id: Mapped[int] = mapped_column(
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    ticket: Mapped["Ticket"] = relationship(
        back_populates="assignee_links",
    )

    __table_args__ = (
        UniqueConstraint(
            "ticket_id",
            "user_id",
            name="uq_ticket_assignee",
        ),
    )


class TicketDeadlineHistory(Base):
    __tablename__ = "ticket_deadline_history"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    ticket_id: Mapped[int] = mapped_column(
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    previous_deadline: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    new_deadline: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    changed_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    changed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    ticket: Mapped["Ticket"] = relationship(
        back_populates="deadline_history",
    )


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    key: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[TicketStatus] = mapped_column(
        SqlEnum(TicketStatus),
        nullable=False,
        default=TicketStatus.BACKLOG,
    )

    priority: Mapped[TicketPriority] = mapped_column(
        SqlEnum(TicketPriority),
        nullable=False,
        default=TicketPriority.MEDIUM,
    )

    labels: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        default="",
    )

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id"),
        nullable=False,
        index=True,
    )

    assignee_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    deadline: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    drive_link_required: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    submitted_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    drive_link: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    review_feedback: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    last_reviewed_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    last_reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    assignee_links: Mapped[list["TicketAssignee"]] = relationship(
        back_populates="ticket",
        cascade="all, delete-orphan",
    )

    deadline_history: Mapped[list["TicketDeadlineHistory"]] = relationship(
        cascade="all, delete-orphan",
        back_populates="ticket",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )