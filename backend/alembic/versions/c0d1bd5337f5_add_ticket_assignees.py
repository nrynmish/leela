"""add ticket assignees table

Revision ID: c0d1bd5337f5
Revises: 847dfbe4247a
Create Date: 2026-10-27

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c0d1bd5337f5"
down_revision: Union[str, Sequence[str], None] = "847dfbe4247a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ticket_assignees",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticket_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["ticket_id"],
            ["tickets.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "ticket_id",
            "user_id",
            name="uq_ticket_assignee",
        ),
    )

    op.create_index(
        op.f("ix_ticket_assignees_id"),
        "ticket_assignees",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_ticket_assignees_ticket_id"),
        "ticket_assignees",
        ["ticket_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_ticket_assignees_user_id"),
        "ticket_assignees",
        ["user_id"],
        unique=False,
    )

    op.execute(
        """
        INSERT INTO ticket_assignees (ticket_id, user_id)
        SELECT id, assignee_id
        FROM tickets
        WHERE assignee_id IS NOT NULL
        """
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_ticket_assignees_user_id"),
        table_name="ticket_assignees",
    )
    op.drop_index(
        op.f("ix_ticket_assignees_ticket_id"),
        table_name="ticket_assignees",
    )
    op.drop_index(
        op.f("ix_ticket_assignees_id"),
        table_name="ticket_assignees",
    )
    op.drop_table("ticket_assignees")
