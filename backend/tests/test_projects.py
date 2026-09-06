def test_all_authenticated_users_can_list_projects(
    client,
    auth_headers,
    users,
):
    for role in ["admin", "head", "member"]:
        response = client.get(
            "/projects",
            headers=auth_headers(users[role]),
        )

        assert response.status_code == 200


def test_all_authenticated_users_can_view_project(
    client,
    auth_headers,
    users,
    project,
):
    for role in ["admin", "head", "member"]:
        response = client.get(
            f"/projects/{project.id}",
            headers=auth_headers(users[role]),
        )

        assert response.status_code == 200


def test_admin_can_create_project(
    client,
    auth_headers,
    users,
):
    response = client.post(
        "/projects",
        headers=auth_headers(users["admin"]),
        json={
            "name": "Admin Project",
            "objective": "Test objective",
            "description": "Test description",
        },
    )

    assert response.status_code == 201


def test_head_can_create_project(
    client,
    auth_headers,
    users,
):
    response = client.post(
        "/projects",
        headers=auth_headers(users["head"]),
        json={
            "name": "Head Project",
            "objective": "Test objective",
            "description": "Test description",
        },
    )

    assert response.status_code == 201


def test_member_cannot_create_project(
    client,
    auth_headers,
    users,
):
    response = client.post(
        "/projects",
        headers=auth_headers(users["member"]),
        json={
            "name": "Member Project",
            "objective": "Test objective",
            "description": "Test description",
        },
    )

    assert response.status_code == 403


def test_admin_can_edit_project(
    client,
    auth_headers,
    users,
    project,
):
    response = client.patch(
        f"/projects/{project.id}",
        headers=auth_headers(users["admin"]),
        json={
            "name": "Updated By Admin",
        },
    )

    assert response.status_code == 200


def test_head_can_edit_project(
    client,
    auth_headers,
    users,
    project,
):
    response = client.patch(
        f"/projects/{project.id}",
        headers=auth_headers(users["head"]),
        json={
            "name": "Updated By Head",
        },
    )

    assert response.status_code == 200


def test_member_cannot_edit_project(
    client,
    auth_headers,
    users,
    project,
):
    response = client.patch(
        f"/projects/{project.id}",
        headers=auth_headers(users["member"]),
        json={
            "name": "Updated By Member",
        },
    )

    assert response.status_code == 403


def test_admin_can_delete_project(
    client,
    auth_headers,
    users,
    project,
):
    response = client.delete(
        f"/projects/{project.id}",
        headers=auth_headers(users["admin"]),
    )

    assert response.status_code == 204


def test_head_cannot_delete_project(
    client,
    auth_headers,
    users,
    project,
):
    response = client.delete(
        f"/projects/{project.id}",
        headers=auth_headers(users["head"]),
    )

    assert response.status_code == 403


def test_member_cannot_delete_project(
    client,
    auth_headers,
    users,
    project,
):
    response = client.delete(
        f"/projects/{project.id}",
        headers=auth_headers(users["member"]),
    )

    assert response.status_code == 403