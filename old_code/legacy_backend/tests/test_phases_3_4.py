import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.repositories.user_repo import user_repo
from app.repositories.question_repo import question_repo
from app.schemas import UserCreate, AssessmentCreate, QuestionCreate

@pytest.fixture
def student_token(client: TestClient, db: Session):
    student_in = UserCreate(username="student1", email="student1@example.com", password="password123", role="student")
    user_repo.create(db, obj_in=student_in)
    login_response = client.post(
        "/api/v1/auth/token",
        data={"username": "student1", "password": "password123"},
    )
    return login_response.json()["access_token"]

@pytest.fixture
def admin_token(client: TestClient, db: Session):
    admin_in = UserCreate(username="admin1", email="admin1@example.com", password="password123", role="super_admin")
    user_repo.create(db, obj_in=admin_in)
    login_response = client.post(
        "/api/v1/auth/token",
        data={"username": "admin1", "password": "password123"},
    )
    return login_response.json()["access_token"]

def test_assessment_workflow(client: TestClient, admin_token: str, student_token: str, db: Session):
    # 1. Create Questions
    q1 = question_repo.create(db, obj_in=QuestionCreate(
        category="math",
        question_text="1+1?",
        options=["1", "2", "3"],
        correct_answer="2"
    ))
    q2 = question_repo.create(db, obj_in=QuestionCreate(
        category="math",
        question_text="2+2?",
        options=["2", "4", "6"],
        correct_answer="4"
    ))

    # 2. Create Assessment (Admin)
    response = client.post(
        "/api/v1/assessments/",
        json={
            "title": "Math Quiz",
            "description": "Simple math",
            "duration_minutes": 10,
            "total_questions": 2,
            "is_published": True,
            "question_ids": [q1.id, q2.id]
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assessment_id = response.json()["id"]

    # 3. Start Assessment (Student)
    response = client.post(
        f"/api/v1/assessments/{assessment_id}/start",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    attempt_id = response.json()["id"]

    # 4. Submit Assessment
    response = client.post(
        f"/api/v1/assessments/attempts/{attempt_id}/submit",
        json={
            str(q1.id): "2",
            str(q2.id): "4"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 2.0
    assert data["percentage"] == 100.0
    assert data["status"] == "completed"

def test_interview_workflow(client: TestClient, student_token: str, db: Session):
    # 1. Create Interview Questions
    question_repo.create(db, obj_in=QuestionCreate(
        category="Frontend",
        question_text="What is React?",
        options=[],
        correct_answer="N/A"
    ))

    # 2. Start Interview Session
    response = client.post(
        "/api/v1/interviews/start?category=Frontend",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    session_id = data["session"]["id"]
    assert len(data["questions"]) > 0

    # 3. Submit Interview Session
    response = client.post(
        f"/api/v1/interviews/sessions/{session_id}/submit",
        json={
            "responses": [
                {"question_id": 1, "response": "A JS library", "feedback": "Good", "rating": 4}
            ],
            "overall_score": 80.0,
            "feedback": "Great interview"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["overall_score"] == 80.0
