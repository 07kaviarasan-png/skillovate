from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.rbac import UserRole, get_college_scope, get_current_user, require_roles
from app.database import get_db
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.user import StudentProfile, User
from app.schemas.assessment import AssessmentCreateRequest, AssessmentResponse, AssessmentUpdateRequest, AttemptResponse, TestSubmitRequest

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.get("", response_model=list[AssessmentResponse])
def list_assessments(db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    query = db.query(Assessment)
    if college_scope:
        query = query.filter(Assessment.college_id == college_scope)
    return query.order_by(Assessment.created_at.desc()).all()


@router.post("", response_model=AssessmentResponse, dependencies=[require_roles(UserRole.FACULTY, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN)])
def create_assessment(data: AssessmentCreateRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = Assessment(
        **data.model_dump(),
        college_id=current_user.college_id or 1,
        created_by=current_user.id,
        shuffle_questions=True,
        shuffle_options=False,
        show_result_immediately=True,
        max_attempts=1,
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.get("/overview/stats")
def overview_stats(db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    query = db.query(Assessment)
    attempts = db.query(AssessmentAttempt)
    if college_scope:
        query = query.filter(Assessment.college_id == college_scope)
        attempts = attempts.filter(AssessmentAttempt.college_id == college_scope)
    total = query.count()
    attempt_rows = attempts.all()
    avg_score = round(sum(a.percentage or 0 for a in attempt_rows) / len(attempt_rows), 2) if attempt_rows else 0
    return {"success": True, "data": {"total": total, "attempts": len(attempt_rows), "avg_score": avg_score}}


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    query = db.query(Assessment).filter(Assessment.id == assessment_id)
    if college_scope:
        query = query.filter(Assessment.college_id == college_scope)
    assessment = query.first()
    if not assessment:
        raise NotFoundError("Assessment", str(assessment_id))
    return assessment


@router.put("/{assessment_id}", response_model=AssessmentResponse, dependencies=[require_roles(UserRole.FACULTY, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN)])
def update_assessment(assessment_id: int, data: AssessmentUpdateRequest, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    assessment = get_assessment(assessment_id, db, college_scope)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(assessment, key, value)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.delete("/{assessment_id}")
def delete_assessment(assessment_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    assessment = get_assessment(assessment_id, db, college_scope)
    db.delete(assessment)
    db.commit()
    return {"success": True, "message": "Assessment deleted"}


@router.get("/{assessment_id}/results", response_model=list[AttemptResponse])
def assessment_results(assessment_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    query = db.query(AssessmentAttempt).filter(AssessmentAttempt.assessment_id == assessment_id)
    if college_scope:
        query = query.filter(AssessmentAttempt.college_id == college_scope)
    return query.order_by(AssessmentAttempt.created_at.desc()).all()


@router.post("/submit", response_model=AttemptResponse)
def submit_test(data: TestSubmitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = None
    if data.assessment_id:
        assessment = db.query(Assessment).filter(Assessment.id == data.assessment_id).first()
    if not assessment:
        assessment = Assessment(
            title="Practice Test",
            assessment_type="mixed",
            college_id=current_user.college_id or 1,
            created_by=current_user.id,
            duration_minutes=30,
            total_marks=data.max_score,
            pass_percentage=40,
            status="active",
            difficulty="medium",
        )
        db.add(assessment)
        db.flush()
    pct = data.percentage if data.percentage is not None else round((data.score / data.max_score) * 100, 2)
    attempt_number = db.query(AssessmentAttempt).filter(AssessmentAttempt.assessment_id == assessment.id, AssessmentAttempt.student_id == current_user.id).count() + 1
    attempt = AssessmentAttempt(
        assessment_id=assessment.id,
        student_id=current_user.id,
        college_id=current_user.college_id or assessment.college_id,
        attempt_number=attempt_number,
        score=data.score,
        max_score=data.max_score,
        percentage=pct,
        time_taken_seconds=data.time_taken_seconds,
        passed=pct >= assessment.pass_percentage,
        status="completed",
        completed_at=datetime.now(timezone.utc),
        section_scores=data.section_scores,
        weak_areas=data.weak_areas,
    )
    db.add(attempt)
    profile = current_user.student_profile
    if profile:
        profile.tests_completed += 1
        profile.avg_accuracy = round(((profile.avg_accuracy * (profile.tests_completed - 1)) + pct) / profile.tests_completed, 2)
    db.commit()
    db.refresh(attempt)
    return attempt
