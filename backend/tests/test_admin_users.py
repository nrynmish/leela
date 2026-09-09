from app.core.enums import UserRole, TicketPriority, TicketStatus
from app.models.project import Project
from app.models.ticket import Ticket
from app.models.user import User


def test_admin_list_users(client, auth_headers, users):
    response = client.get(
        "/admin/users",
        headers=auth_headers(users["admin"]),
    )

    assert response.status_code == 200
    assert len(response.json()) >= 3


def test_admin_can_delete_other_user_and_cleanup(client, auth_headers, users, db):
    target = User(
        roll_no="TEST/TARGET/001",
        email="target@test.local",
        full_name="Target User",
        department="Testing",
        password_hash="hashed-password",
        role=UserRole.MEMBER,
    )
    db.add(target)
    db.commit()
    db.refresh(target)

    base_project = Project(
        name="Base Project",
        objective="Base objective",
        description="Base description",
        created_by=users["admin"].id,
    )
    db.add(base_project)
    db.commit()
    db.refresh(base_project)

    owned_project = Project(
        name="Owned Project",
        objective="Owned objective",
        description="Owned description",
        created_by=target.id,
    )
    db.add(owned_project)
    db.commit()
    db.refresh(owned_project)

    assigned_ticket = Ticket(
        key="LEL-001",
        title="Assigned Ticket",
        summary="Ticket assigned to target",
        status=TicketStatus.BACKLOG,
        priority=TicketPriority.MEDIUM,
        labels="",
        project_id=base_project.id,
        assignee_id=target.id,
        created_by=users["admin"].id,
    )
    created_ticket = Ticket(
        key="LEL-002",
        title="Created Ticket",
        summary="Ticket created by target",
        status=TicketStatus.BACKLOG,
        priority=TicketPriority.MEDIUM,
        labels="",
        project_id=base_project.id,
        assignee_id=users["head"].id,
        created_by=target.id,
    )
    project_ticket = Ticket(
        key="LEL-003",
        title="Project Ticket",
        summary="Ticket on target project's project",
        status=TicketStatus.BACKLOG,
        priority=TicketPriority.MEDIUM,
        labels="",
        project_id=owned_project.id,
        assignee_id=users["member"].id,
        created_by=users["head"].id,
    )

    db.add_all([assigned_ticket, created_ticket, project_ticket])
    db.commit()

    response = client.delete(
        f"/admin/users/{target.id}",
        headers=auth_headers(users["admin"]),
    )

    assert response.status_code == 204
    assert response.content == b""

    assert db.get(User, target.id) is None
    assert db.get(Ticket, created_ticket.id) is None
    assert db.get(Ticket, project_ticket.id) is None
    assert db.get(Project, owned_project.id) is None

    refreshed_assigned = db.get(Ticket, assigned_ticket.id)
    assert refreshed_assigned is not None
    assert refreshed_assigned.assignee_id is None


def test_admin_cannot_delete_self(client, auth_headers, users):
    response = client.delete(
        f"/admin/users/{users['admin'].id}",
        headers=auth_headers(users["admin"]),
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "You cannot delete your own account"


def test_admin_delete_missing_user_returns_404(client, auth_headers, users):
    response = client.delete(
        "/admin/users/999999",
        headers=auth_headers(users["admin"]),
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "User not found"


def test_head_and_member_cannot_delete_users(client, auth_headers, users):
    for role in ["head", "member"]:
        response = client.delete(
            f"/admin/users/{users['admin'].id}",
            headers=auth_headers(users[role]),
        )

        assert response.status_code == 403
