"""add langsmith api key and sentry preferences to user details

Revision ID: 9425e09b2c83
Revises: 6a78ebe5b53e
Create Date: 2024-05-27 20:00:40.421725

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9425e09b2c83"
down_revision: Union[str, None] = "6a78ebe5b53e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.add_column(sa.Column("langsmith_api_key", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("sentry_enabled", sa.Boolean(), server_default=sa.text("1"), nullable=False))

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("user", schema=None) as batch_op:
        batch_op.drop_column("langsmith_api_key")
        batch_op.drop_column("sentry_enabled")
    # ### end Alembic commands ###