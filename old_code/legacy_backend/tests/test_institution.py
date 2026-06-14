import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.repositories.user_repo import user_repo
from app.repositories.college_repo import college_repo
from app.schemas import UserCreate, CollegeCreate

@pytest.fixture
def admin_token(client: TestClient, db: Session):
    admin_in = UserCreate(username="admin", email="admin@example.com", password="password123", role="super_admin")
    user_repo.create(db, obj_in=admin_in)
    login_response = client.post(
        "/api/v1/auth/token",
        data={"username": "admin", "password": "password123"},
    )
    return login_response.json()["access_token"]

def test_manage_colleges(client: TestClient, admin_token: str):
    # Create
    response = client.post(
        "/api/v1/colleges/",
        json={"name": "Engineering College", "code": "ENG01"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    college_id = response.json()["id"]

    # Read
    response = client.get("/api/v1/colleges/")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert any(c["code"] == "ENG01" for c in data["items"])

    # Update
    response = client.put(
        f"/api/v1/colleges/{college_id}",
        json={"name": "Updated Engineering College"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Engineering College"

def test_manage_batches(client: TestClient, admin_token: str, db: Session):
    # Create college first
    col_in = CollegeCreate(name="Batch College", code="BC001")
    college = college_repo.create(db, obj_in=col_in)
    
    # Create batch
    response = client.post(
        "/api/v1/batches/",
        json={"name": "2024 Tech Batch", "college_id": college.id, "academic_year": "2024-25"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    batch_id = response.json()["id"]

    # List batches
    response = client.get(
        f"/api/v1/batches/",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(b["name"] == "2024 Tech Batch" for b in data["items"])
