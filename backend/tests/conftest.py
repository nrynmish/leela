import os

# IMPORTANT:
# Tests must never accidentally run against the development database.
os.environ["DATABASE_URL"] = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql://nryn:bhosda@localhost:5432/leela_test",
)

os.environ["JWT_SECRET_KEY"] = "test-secret-key"

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.database import Base, get_db
from app.models.user import User
from app.models.project import Project
from app.models.ticket import Ticket
from app.core.enums import UserRole


TEST_DATABASE_URL = os.environ["DATABASE_URL"]

print(f"\nTEST DATABASE URL: {TEST_DATABASE_URL}\n")

engine = create_engine(
    TEST_DATABASE_URL,
    echo=False,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    yield

    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def users(db):
    """
    Create the three RBAC test users.

    Generate the expensive password hash only once and reuse it
    for all three users.
    """
    from app.services.security import hash_password

    test_password_hash = hash_password("password123")

    member = User(
        roll_no="TEST/MEMBER/001",
        email="member@test.local",
        full_name="Test Member",
        department="Testing",
        password_hash=test_password_hash,
        role=UserRole.MEMBER,
    )

    head = User(
        roll_no="TEST/HEAD/001",
        email="head@test.local",
        full_name="Test Head",
        department="Testing",
        password_hash=test_password_hash,
        role=UserRole.HEAD,
    )

    admin = User(
        roll_no="TEST/ADMIN/001",
        email="admin@test.local",
        full_name="Test Admin",
        department="Testing",
        password_hash=test_password_hash,
        role=UserRole.ADMIN,
    )

    db.add_all([
        member,
        head,
        admin,
    ])

    db.commit()

    db.refresh(member)
    db.refresh(head)
    db.refresh(admin)

    return {
        "member": member,
        "head": head,
        "admin": admin,
    }


@pytest.fixture
def login(client):
    def _login(user):
        response = client.post(
            "/auth/login",
            json={
                "roll_no": user.roll_no,
                "password": "password123",
            },
        )

        assert response.status_code == 200, response.text

        return response.json()["access_token"]

    return _login


@pytest.fixture
def auth_headers(login):
    def _headers(user):
        token = login(user)

        return {
            "Authorization": f"Bearer {token}",
        }

    return _headers