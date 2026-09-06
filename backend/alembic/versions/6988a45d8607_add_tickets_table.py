"""add tickets table

Revision ID: 6988a45d8607
Revises: ac78db23fc82
Create Date: 2026-09-06 06:31:47.392132

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "6988a45d8607"
down_revision: Union[str, Sequence[str], None] = "ac78db23fc82"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()

    ticket_status = postgresql.ENUM(
        "BACKLOG",
        "TODO",
        "IN_PROGRESS",
        "REVIEW",
        "DONE",
        name="ticketstatus",
    )

    ticket_priority = postgresql.ENUM(
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
        name="ticketpriority",
    )

    ticket_status.create(bind, checkfirst=True)
    ticket_priority.create(bind, checkfirst=True)

    op.create_table(
        "tickets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("key", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM(
                "BACKLOG",
                "TODO",
                "IN_PROGRESS",
                "REVIEW",
                "DONE",
                name="ticketstatus",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "priority",
            postgresql.ENUM(
                "LOW",
                "MEDIUM",
                "HIGH",
                "URGENT",
                name="ticketpriority",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("labels", sa.Text(), nullable=False),
        sa.Column("project_id", sa.Integer(), nullable=False),
        sa.Column("assignee_id", sa.Integer(), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
        ),
        sa.ForeignKeyConstraint(
            ["assignee_id"],
            ["users.id"],
        ),
        sa.ForeignKeyConstraint(
            ["created_by"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_tickets_id"),
        "tickets",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_tickets_key"),
        "tickets",
        ["key"],
        unique=True,
    )

    op.create_index(
        op.f("ix_tickets_project_id"),
        "tickets",
        ["project_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_tickets_assignee_id"),
        "tickets",
        ["assignee_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_tickets_assignee_id"),
        table_name="tickets",
    )
    op.drop_index(
        op.f("ix_tickets_project_id"),
        table_name="tickets",
    )
    op.drop_index(
        op.f("ix_tickets_key"),
        table_name="tickets",
    )
    op.drop_index(
        op.f("ix_tickets_id"),
        table_name="tickets",
    )
    op.drop_table("tickets")

    bind = op.get_bind()

    postgresql.ENUM(
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
        name="ticketpriority",
    ).drop(bind, checkfirst=True)

    postgresql.ENUM(
        "BACKLOG",
        "TODO",
        "IN_PROGRESS",
        "REVIEW",
        "DONE",
        name="ticketstatus",
    ).drop(bind, checkfirst=True)
