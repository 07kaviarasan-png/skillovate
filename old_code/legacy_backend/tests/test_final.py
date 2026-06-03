import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_create_recruiter_and_job():
    # 1. Register a recruiter
    recruiter_data = {
        "email": "recruiter@example.com",
        "username": "recruiter_user",
        "password": "password123",
        "role": "recruiter",
        "recruiter_profile": {
            "company_name": "Test Corp",
            "company_website": "https://test.com",
            "industry": "Tech"
        }
    }
    client.post("/api/v1/auth/register", json=recruiter_data)
    
    # Login to get token
    login_res = client.post("/api/v1/auth/token", data={"username": "recruiter_user", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Job
    job_data = {
        "title": "Software Engineer",
        "description": "Develop cool stuff",
        "location": "Remote",
        "salary_range": "100k-120k",
        "job_type": "Full-time"
    }
    response = client.post("/api/v1/placements/jobs", json=job_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Software Engineer"

def test_student_apply_and_dashboard():
    # 1. Register student
    student_data = {
        "email": "student@example.com",
        "username": "student_user",
        "password": "password123",
        "role": "student",
        "student_profile": {
            "college_id": 1,
            "full_name": "Test Student",
            "graduation_year": 2024
        }
    }
    # Ensure college exists
    from app.models import College
    db = TestingSessionLocal()
    if not db.query(College).filter(College.id == 1).first():
        college = College(id=1, name="Test College", code="TEST001", address="Test Address")
        db.add(college)
        db.commit()
    db.close()

    client.post("/api/v1/auth/register", json=student_data)
    
    # Login
    login_res = client.post("/api/v1/auth/token", data={"username": "student_user", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Browse Jobs
    jobs_res = client.get("/api/v1/placements/jobs", headers=headers)
    assert jobs_res.status_code == 200
    job_id = jobs_res.json()[0]["id"]

    # 3. Apply
    apply_res = client.post("/api/v1/placements/apply", json={"job_id": job_id}, headers=headers)
    assert apply_res.status_code == 200
    assert apply_res.json()["status"] == "Applied"

    # 4. Check Dashboard Stats
    stats_res = client.get("/api/v1/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    assert stats_res.json()["total_applications"] == 1
