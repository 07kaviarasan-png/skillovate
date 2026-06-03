import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.repositories.user_repo import user_repo
from app.schemas import UserCreate
from app.crud import get_password_hash

def test_register_user(client: TestClient):
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_login_user(client: TestClient, db: Session):
    # Pre-create user
    user_in = UserCreate(username="loginuser", email="login@example.com", password="password123")
    user_repo.create(db, obj_in=user_in)
    
    response = client.post(
        "/api/v1/auth/token",
        data={"username": "loginuser", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_get_me(client: TestClient, db: Session):
    # Pre-create user and login
    user_in = UserCreate(username="meuser", email="me@example.com", password="password123")
    user_repo.create(db, obj_in=user_in)
    
    login_response = client.post(
        "/api/v1/auth/token",
        data={"username": "meuser", "password": "password123"},
    )
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "meuser"

def test_rbac_super_admin(client: TestClient, db: Session):
    # Create a super admin
    admin_in = UserCreate(username="admin", email="admin@example.com", password="password123", role="super_admin")
    user_repo.create(db, obj_in=admin_in)
    
    login_response = client.post(
        "/api/v1/auth/token",
        data={"username": "admin", "password": "password123"},
    )
    token = login_response.json()["access_token"]
    
    # Create a college (requires super_admin)
    response = client.post(
        "/api/v1/colleges/",
        json={"name": "Test College", "code": "TC001", "is_active": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test College"

def test_rbac_student_forbidden(client: TestClient, db: Session):
    # Create a student
    student_in = UserCreate(username="student", email="student@example.com", password="password123", role="student")
    user_repo.create(db, obj_in=student_in)
    
    login_response = client.post(
        "/api/v1/auth/token",
        data={"username": "student", "password": "password123"},
    )
    token = login_response.json()["access_token"]
    
    # Try to create a college (should fail)
    response = client.post(
        "/api/v1/colleges/",
        json={"name": "Fail College", "code": "FC001"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
