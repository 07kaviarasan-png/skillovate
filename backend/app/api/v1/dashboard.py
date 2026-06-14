from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.rbac import UserRole, get_college_scope, require_roles
from app.database import get_db
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.interview import InterviewAttempt
from app.models.placement import Placement
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/student/{student_id}")
def student_dashboard(student_id: int, db: Session = Depends(get_db)):
    attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.student_id == student_id, AssessmentAttempt.status == "completed").all()
    interviews = db.query(InterviewAttempt).filter(InterviewAttempt.student_id == student_id).count()
    placements = db.query(Placement).filter(Placement.student_id == student_id).count()
    avg = round(sum(a.percentage or 0 for a in attempts) / len(attempts), 2) if attempts else 0
    return {
        "success": True,
        "data": {
            "tests_completed": len(attempts),
            "avg_accuracy": avg,
            "interviews_completed": interviews,
            "placements": placements,
            "recent_tests": attempts[-5:],
        },
    }


@router.get("/admin", dependencies=[require_roles(UserRole.FACULTY, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN)])
def admin_dashboard(db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    students = db.query(User).filter(User.role == "student")
    assessments = db.query(Assessment)
    attempts = db.query(AssessmentAttempt)
    placements = db.query(Placement)
    if college_scope:
        students = students.filter(User.college_id == college_scope)
        assessments = assessments.filter(Assessment.college_id == college_scope)
        attempts = attempts.filter(AssessmentAttempt.college_id == college_scope)
        placements = placements.filter(Placement.college_id == college_scope)
    avg = attempts.with_entities(func.avg(AssessmentAttempt.percentage)).scalar() or 0
    return {
        "success": True,
        "data": {
            "students": students.count(),
            "assessments": assessments.count(),
            "attempts": attempts.count(),
            "placements": placements.count(),
            "avg_score": round(float(avg), 2),
        },
    }


@router.get("/super", dependencies=[require_roles(UserRole.SUPER_ADMIN)])
def super_dashboard(db: Session = Depends(get_db)):
    return {
        "success": True,
        "data": {
            "students": db.query(User).filter(User.role == "student").count(),
            "faculty": db.query(User).filter(User.role == "faculty").count(),
            "admins": db.query(User).filter(User.role == "college_admin").count(),
            "recruiters": db.query(User).filter(User.role == "recruiter").count(),
        },
    }
