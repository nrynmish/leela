from app.core.enums import TicketPriority, TicketStatus, UserRole
from app.models.project import Project
from app.models.ticket import Ticket, TicketAssignee
from app.models.user import User


def test_delete_ticket_removes_assignee_row_for_single_assignee(client, auth_headers, users, db):
    project = Project(
        name="Delete Test Project",
        objective="Objective",
        description="Description",
        created_by=users["admin"].id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    ticket = Ticket(
        key="LEL-100",
        title="Single assignee delete",
        summary="Delete me",
        status=TicketStatus.BACKLOG,
        priority=TicketPriority.MEDIUM,
        labels="",
        project_id=project.id,
        assignee_id=users["member"].id,
        created_by=users["head"].id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    db.add(TicketAssignee(ticket_id=ticket.id, user_id=users["member"].id))
    db.commit()

    response = client.delete(
        f"/tickets/{ticket.id}",
        headers=auth_headers(users["head"]),
    )

    assert response.status_code == 204
    assert db.get(Ticket, ticket.id) is None
    assert db.scalar(
        __import__("sqlalchemy").select(TicketAssignee).where(
            TicketAssignee.ticket_id == ticket.id,
        )
    ) is None


def test_delete_ticket_removes_all_assignee_rows_for_shared_ticket(client, auth_headers, users, db):
    project = Project(
        name="Shared Delete Project",
        objective="Objective",
        description="Description",
        created_by=users["admin"].id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    member_two = User(
        roll_no="TEST/MEMBER/002",
        email="member2@test.local",
        full_name="Second Member",
        department="Testing",
        password_hash="hashed-password",
        role=UserRole.MEMBER,
        status="approved",
    )
    db.add(member_two)
    db.commit()
    db.refresh(member_two)

    ticket = Ticket(
        key="LEL-101",
        title="Shared delete",
        summary="Delete shared ticket",
        status=TicketStatus.BACKLOG,
        priority=TicketPriority.MEDIUM,
        labels="",
        project_id=project.id,
        assignee_id=users["member"].id,
        created_by=users["head"].id,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    assignments = [
        TicketAssignee(ticket_id=ticket.id, user_id=users["member"].id),
        TicketAssignee(ticket_id=ticket.id, user_id=member_two.id),
    ]
    db.add_all(assignments)
    db.commit()

    response = client.delete(
        f"/tickets/{ticket.id}",
        headers=auth_headers(users["head"]),
    )

    assert response.status_code == 204
    assert db.get(Ticket, ticket.id) is None
    assert db.scalars(
        __import__("sqlalchemy").select(TicketAssignee).where(
            TicketAssignee.ticket_id == ticket.id,
        )
    ).all() == []
