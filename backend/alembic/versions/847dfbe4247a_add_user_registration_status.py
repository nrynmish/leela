"""add user registration status

Revision ID: 847dfbe4247a
Revises: 6988a45d8607
Create Date: 2026-09-10
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "847dfbe4247a"
down_revision: Union[str, Sequence[str], None] = "6988a45d8607"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


user_status_enum = sa.Enum(
    "PENDING",
    "APPROVED",
    "REJECTED",
    name="userstatus",
)


def upgrade() -> None:
    user_status_enum.create(
        op.get_bind(),
        checkfirst=True,
    )

    op.add_column(
        "users",
        sa.Column(
            "status",
            user_status_enum,
            nullable=True,
        ),
    )

    op.execute(
        "UPDATE users SET status = 'APPROVED' WHERE status IS NULL"
    )

    op.alter_column(
        "users",
        "status",
        nullable=False,
    )


def downgrade() -> None:
    op.drop_column(
        "users",
        "status",
    )

    user_status_enum.drop(
        op.get_bind(),
        checkfirst=True,
    )