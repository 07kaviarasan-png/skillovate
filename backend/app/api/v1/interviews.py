from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.rbac import get_college_scope, get_current_user
from app.database import get_db
from app.models.interview import InterviewAttempt, InterviewResponse
from app.models.user import User
from app.schemas.interview import InterviewAttemptResponse, InterviewSubmitRequest

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.get("/student/{student_id}", response_model=list[InterviewAttemptResponse])
def list_interviews(student_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    query = db.query(InterviewAttempt).filter(InterviewAttempt.student_id == student_id)
    if college_scope:
        query = query.filter(InterviewAttempt.college_id == college_scope)
    return query.order_by(InterviewAttempt.created_at.desc()).all()


@router.post("/student/{student_id}", response_model=InterviewAttemptResponse)
def submit_interview(student_id: int, data: InterviewSubmitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempt_number = db.query(InterviewAttempt).filter(InterviewAttempt.student_id == student_id).count() + 1
    attempt = InterviewAttempt(
        student_id=student_id,
        college_id=current_user.college_id or 1,
        role=data.role,
        category=data.category,
        overall_rating=data.overall_rating,
        strengths=data.strengths,
        improvements=data.improvements,
        duration_seconds=data.duration_seconds,
        attempt_number=attempt_number,
        status="completed",
    )
    db.add(attempt)
    db.flush()
    for response in data.responses:
        db.add(InterviewResponse(attempt_id=attempt.id, **response.model_dump()))
    student = db.query(User).filter(User.id == student_id).first()
    if student and student.student_profile:
        student.student_profile.interviews_completed += 1
    db.commit()
    db.refresh(attempt)
    return attempt
