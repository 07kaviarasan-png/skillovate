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

@router.post("/generate", response_model=list[dict])
def generate_questions(role: str, company: str = "general", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Generates 10 random questions for the given role and company.
    Currently returns mock data, but can be wired up to an LLM.
    """
    import random
    
    # Mock question pool
    question_pool = [
        "What are the key differences between React and Angular?",
        "Explain the concept of closures in JavaScript.",
        "How would you optimize a slow-performing database query?",
        "Describe a time you had to resolve a conflict within your team.",
        "What is the difference between TCP and UDP?",
        "How do you ensure your code is secure from common vulnerabilities?",
        "Explain the CAP theorem and its implications in system design.",
        "What is your approach to testing and test-driven development?",
        "How do you stay updated with the latest technology trends?",
        "Describe the architecture of the most complex system you've worked on.",
        "What are microservices, and what are their pros and cons?",
        "Explain how garbage collection works in your preferred programming language.",
        "How do you handle state management in large frontend applications?",
        "What is CI/CD, and why is it important?",
        "Describe your experience with containerization technologies like Docker."
    ]
    
    selected_questions = random.sample(question_pool, 10)
    
    # Format the questions
    formatted_questions = []
    for i, q in enumerate(selected_questions):
        formatted_questions.append({
            "id": i + 1,
            "text": f"[{company.upper()} - {role.upper()}] {q}",
            "time_limit_seconds": 60,
            "type": "technical" if i < 7 else "behavioral"
        })
        
    return formatted_questions
