from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.rbac import UserRole, get_college_scope, require_roles, get_current_user
from app.core.security import hash_password
from app.database import get_db
from app.models.college import College
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.interview import InterviewAttempt, InterviewResponse
from app.models.user import StudentProfile, User
from app.schemas.assessment import AttemptResponse
from app.schemas.interview import InterviewAttemptResponse, InterviewSubmitRequest
from app.schemas.common import MessageResponse
from app.schemas.user import StudentProfileUpdateRequest, UserResponse, UserUpdateRequest

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("", response_model=list[UserResponse], dependencies=[require_roles(UserRole.FACULTY, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN)])
def list_students(
    search: str | None = None,
    department: str | None = None,
    year: int | None = None,
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
    college_scope: int | None = get_college_scope,
):
    query = db.query(User).outerjoin(StudentProfile).filter(User.role == "student")
    if college_scope:
        query = query.filter(User.college_id == college_scope)
    if department:
        query = query.filter(User.department == department)
    if year:
        query = query.filter(StudentProfile.year == year)
    if search:
        term = f"%{search}%"
        query = query.filter(or_(User.name.ilike(term), User.email.ilike(term), StudentProfile.student_id.ilike(term)))
    return query.order_by(User.name.asc()).limit(limit).all()


@router.post("/identify")
def identify_student(data: dict, db: Session = Depends(get_db)):
    college_name = str(data.get("college_id") or data.get("collegeName") or "").strip()
    roll_no = str(data.get("roll_no") or data.get("studentId") or "").strip().upper()
    college = db.query(College).filter(College.name.ilike(college_name)).first()
    if not college:
        raise NotFoundError("College", college_name)
    student = (
        db.query(User)
        .join(StudentProfile)
        .filter(User.college_id == college.id, StudentProfile.student_id == roll_no)
        .first()
    )
    if not student:
        raise NotFoundError("Student", roll_no)
    profile = student.student_profile
    return {
        "success": True,
        "student": {
            "internal_id": student.id,
            "id": profile.student_id,
            "name": student.name,
            "college": college.name,
            "college_id": college.id,
            "department": student.department,
            "year": profile.year if profile else None,
            "stats": {
                "tests_completed": profile.tests_completed if profile else 0,
                "avg_accuracy": profile.avg_accuracy if profile else 0,
                "interviews_completed": profile.interviews_completed if profile else 0,
                "streak": profile.streak if profile else 0,
            },
            "profile_data": {},
            "resumeData": {},
            "jobApplications": [],
            "trackProgress": {},
        },
        "history": {"tests": [], "interviews": [], "total_attempts": 0},
    }


@router.get("/{student_id}", response_model=UserResponse)
def get_student(student_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    query = db.query(User).filter(User.id == student_id, User.role == "student")
    if college_scope:
        query = query.filter(User.college_id == college_scope)
    student = query.first()
    if not student:
        raise NotFoundError("Student", str(student_id))
    return student


@router.put("/{student_id}", response_model=UserResponse)
def update_student(
    student_id: int,
    data: UserUpdateRequest,
    db: Session = Depends(get_db),
    college_scope: int | None = get_college_scope,
):
    student = get_student(student_id, db, college_scope)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


@router.put("/{student_id}/profile", response_model=MessageResponse)
def update_student_profile(student_id: int, data: StudentProfileUpdateRequest, db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
    if not profile:
        profile = StudentProfile(user_id=student_id)
        db.add(profile)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    db.commit()
    return MessageResponse(message="Student profile updated")


@router.get("/{student_id}/dashboard")
def get_student_dashboard(student_id: int, db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
    if not profile:
        profile = StudentProfile(user_id=student_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return {
        "tests_completed": profile.tests_completed,
        "avg_accuracy": round(profile.avg_accuracy, 1),
        "interviews_completed": profile.interviews_completed,
        "streak": profile.streak,
        "national_rank": profile.national_rank or "-",
        "placement_status": profile.placement_status
    }

@router.get("/{student_id}/tests", response_model=list[AttemptResponse])
def student_tests(student_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    query = db.query(AssessmentAttempt).filter(AssessmentAttempt.student_id == student_id)
    if college_scope:
        query = query.filter(AssessmentAttempt.college_id == college_scope)
    return query.order_by(AssessmentAttempt.created_at.desc()).all()


@router.post("/{student_id}/tests", response_model=MessageResponse)
def log_student_test(student_id: int, data: dict, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise NotFoundError("Student", str(student_id))
    score = int(data.get("score") or 0)
    max_score = int(data.get("max_score") or data.get("total") or 100)
    pct = float(data.get("percentage") or round((score / max_score) * 100, 2))
    assessment_id = int(data.get("assessment_id") or 0)
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first() if assessment_id else None
    if not assessment:
        assessment = Assessment(
            title=data.get("testName") or data.get("title") or "Practice Test",
            assessment_type=data.get("type") or "mixed",
            college_id=student.college_id or 1,
            created_by=student_id,
            duration_minutes=int(data.get("duration") or 30),
            total_marks=max_score,
            pass_percentage=40,
            status="active",
            difficulty="medium",
        )
        db.add(assessment)
        db.flush()
    attempt = AssessmentAttempt(
        assessment_id=assessment.id,
        student_id=student_id,
        college_id=student.college_id or 1,
        attempt_number=db.query(AssessmentAttempt).filter(AssessmentAttempt.student_id == student_id).count() + 1,
        score=score,
        max_score=max_score,
        percentage=pct,
        status="completed",
        passed=pct >= 40,
    )
    db.add(attempt)
    if student.student_profile:
        student.student_profile.tests_completed += 1
        student.student_profile.avg_accuracy = round(
            ((student.student_profile.avg_accuracy * (student.student_profile.tests_completed - 1)) + pct)
            / student.student_profile.tests_completed,
            2,
        )
    db.commit()
    return MessageResponse(message="Test attempt logged")


@router.get("/{student_id}/tests/analytics")
def student_test_analytics(student_id: int, db: Session = Depends(get_db)):
    attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.student_id == student_id).all()
    avg = round(sum(a.percentage or 0 for a in attempts) / len(attempts), 2) if attempts else 0
    return {"success": True, "data": {"attempts": len(attempts), "average": avg, "history": attempts}}


@router.get("/{student_id}/interviews", response_model=list[InterviewAttemptResponse])
def student_interviews(student_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    query = db.query(InterviewAttempt).filter(InterviewAttempt.student_id == student_id)
    if college_scope:
        query = query.filter(InterviewAttempt.college_id == college_scope)
    return query.order_by(InterviewAttempt.created_at.desc()).all()


@router.post("/{student_id}/interviews", response_model=InterviewAttemptResponse)
def log_student_interview(student_id: int, data: InterviewSubmitRequest, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise NotFoundError("Student", str(student_id))
    attempt = InterviewAttempt(
        student_id=student_id,
        college_id=student.college_id or 1,
        role=data.role,
        category=data.category,
        overall_rating=data.overall_rating,
        strengths=data.strengths,
        improvements=data.improvements,
        duration_seconds=data.duration_seconds,
        attempt_number=db.query(InterviewAttempt).filter(InterviewAttempt.student_id == student_id).count() + 1,
        status="completed",
    )
    db.add(attempt)
    db.flush()
    for response in data.responses:
        db.add(InterviewResponse(attempt_id=attempt.id, **response.model_dump()))
    if student.student_profile:
        student.student_profile.interviews_completed += 1
    db.commit()
    db.refresh(attempt)
    return attempt


@router.post("/{student_id}/resume", response_model=MessageResponse)
@router.post("/{student_id}/apply", response_model=MessageResponse)
@router.post("/{student_id}/track", response_model=MessageResponse)
def save_student_portal_state(student_id: int, data: dict):
    return MessageResponse(message="Student state saved")


@router.post("/batch", response_model=MessageResponse, dependencies=[require_roles(UserRole.FACULTY, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN)])
def create_batch_students(
    data: dict, 
    db: Session = Depends(get_db), 
    college_scope: int | None = get_college_scope,
    current_user: User = Depends(get_current_user)
):
    students = data.get("students") or []
    department = data.get("department")
    year = data.get("year")
    created = 0
    # Faculty uploads default to 'pending'. College Admin uploads default to 'approved'.
    default_status = "pending" if current_user.role == "faculty" else "approved"
    
    for item in students:
        email = item.get("email") or f"{item.get('roll') or item.get('studentId')}@skillovate.local"
        if db.query(User).filter(User.email == email.lower()).first():
            continue
        user = User(
            email=email.lower(),
            password_hash=hash_password(item.get("password") or "student123"),
            name=item.get("name"),
            role="student",
            college_id=college_scope,
            department=item.get("department") or department,
            status=default_status,
        )
        db.add(user)
        db.flush()
        db.add(StudentProfile(user_id=user.id, student_id=(item.get("roll") or item.get("studentId") or "").upper(), year=year or item.get("year")))
        created += 1
    db.commit()
    return MessageResponse(message=f"Successfully onboarded {created} students. Status: {default_status}")

@router.get("/pending", response_model=list[UserResponse], dependencies=[require_roles(UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN)])
def list_pending_students(db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    """Get all pending students for the master console."""
    query = db.query(User).filter(User.role == "student", User.status == "pending")
    if college_scope:
        query = query.filter(User.college_id == college_scope)
    return query.order_by(User.created_at.desc()).all()

@router.put("/{student_id}/approve", response_model=UserResponse, dependencies=[require_roles(UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN)])
def approve_student(student_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    """Approve a pending student."""
    query = db.query(User).filter(User.id == student_id, User.role == "student", User.status == "pending")
    if college_scope:
        query = query.filter(User.college_id == college_scope)
    student = query.first()
    if not student:
        raise NotFoundError("Pending Student", str(student_id))
    student.status = "approved"
    db.commit()
    db.refresh(student)
    return student

@router.put("/{student_id}/reject", response_model=UserResponse, dependencies=[require_roles(UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN)])
def reject_student(student_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    """Reject a pending student."""
    query = db.query(User).filter(User.id == student_id, User.role == "student", User.status == "pending")
    if college_scope:
        query = query.filter(User.college_id == college_scope)
    student = query.first()
    if not student:
        raise NotFoundError("Pending Student", str(student_id))
    student.status = "rejected"
    db.commit()
    db.refresh(student)
    return student
