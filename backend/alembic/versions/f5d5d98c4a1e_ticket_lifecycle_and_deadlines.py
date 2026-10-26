"""ticket lifecycle and deadlines

Revision ID: f5d5d98c4a1e
Revises: c0d1bd5337f5
Create Date: 2026-10-27

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f5d5d98c4a1e"
down_revision: Union[str, Sequence[str], None] = "c0d1bd5337f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tickets", sa.Column("deadline", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "tickets",
        sa.Column(
            "drive_link_required",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column("tickets", sa.Column("submitted_by", sa.Integer(), nullable=True))
    op.add_column("tickets", sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("tickets", sa.Column("drive_link", sa.Text(), nullable=True))
    op.add_column("tickets", sa.Column("review_feedback", sa.Text(), nullable=True))
    op.add_column("tickets", sa.Column("last_reviewed_by", sa.Integer(), nullable=True))
    op.add_column("tickets", sa.Column("last_reviewed_at", sa.DateTime(timezone=True), nullable=True))

    op.create_index(op.f("ix_tickets_submitted_by"), "tickets", ["submitted_by"], unique=False)
    op.create_index(op.f("ix_tickets_last_reviewed_by"), "tickets", ["last_reviewed_by"], unique=False)

    op.create_foreign_key(
        "fk_tickets_submitted_by_users",
        "tickets",
        "users",
        ["submitted_by"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_tickets_last_reviewed_by_users",
        "tickets",
        "users",
        ["last_reviewed_by"],
        ["id"],
    )

    op.create_table(
        "ticket_deadline_history",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticket_id", sa.Integer(), nullable=False),
        sa.Column("previous_deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("new_deadline", sa.DateTime(timezone=True), nullable=True),
        sa.Column("changed_by", sa.Integer(), nullable=True),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["ticket_id"], ["tickets.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["changed_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(op.f("ix_ticket_deadline_history_id"), "ticket_deadline_history", ["id"], unique=False)
    op.create_index(op.f("ix_ticket_deadline_history_ticket_id"), "ticket_deadline_history", ["ticket_id"], unique=False)
    op.create_index(op.f("ix_ticket_deadline_history_changed_by"), "ticket_deadline_history", ["changed_by"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ticket_deadline_history_changed_by"), table_name="ticket_deadline_history")
    op.drop_index(op.f("ix_ticket_deadline_history_ticket_id"), table_name="ticket_deadline_history")
    op.drop_index(op.f("ix_ticket_deadline_history_id"), table_name="ticket_deadline_history")
    op.drop_table("ticket_deadline_history")

    op.drop_constraint("fk_tickets_last_reviewed_by_users", "tickets", type_="foreignkey")
    op.drop_constraint("fk_tickets_submitted_by_users", "tickets", type_="foreignkey")

    op.drop_index(op.f("ix_tickets_last_reviewed_by"), table_name="tickets")
    op.drop_index(op.f("ix_tickets_submitted_by"), table_name="tickets")

    op.drop_column("tickets", "last_reviewed_at")
    op.drop_column("tickets", "last_reviewed_by")
    op.drop_column("tickets", "review_feedback")
    op.drop_column("tickets", "drive_link")
    op.drop_column("tickets", "submitted_at")
    op.drop_column("tickets", "submitted_by")
    op.drop_column("tickets", "drive_link_required")
    op.drop_column("tickets", "deadline")
