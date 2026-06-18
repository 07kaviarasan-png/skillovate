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
    Generates 10 random questions for the given role and company using Groq LLM.
    """
    import os
    import json
    from groq import Groq
    from fastapi import HTTPException
    from app.config import get_settings
    
    groq_api_key = get_settings().GROQ_API_KEY
    if not groq_api_key:
        import random
        question_pool = [
            "What are the key differences between React and Angular?",
            "Explain the concept of closures in JavaScript.",
            "How would you optimize a slow-performing database query?",
            "Describe a time you had to resolve a conflict within your team.",
            "What is the difference between TCP and UDP?"
        ]
        selected_questions = random.sample(question_pool * 2, 10)
        return [{"id": i + 1, "text": f"[{company.upper()} - {role.upper()}] {q}", "time_limit_seconds": 60, "type": "technical"} for i, q in enumerate(selected_questions)]

    try:
        client = Groq(api_key=groq_api_key)
        
        prompt = f"""
        You are an expert technical interviewer at {company} hiring for a {role} position.
        Generate exactly 10 interview questions for this specific role and company. 
        Make them realistic, challenging, and a mix of technical (7) and behavioral (3) questions.
        Return the result as a raw JSON object with a single key "questions" containing a list of strings.
        Do not include markdown blocks or any other text outside the JSON.
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )

        result_text = completion.choices[0].message.content.strip()
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.startswith("```"):
            result_text = result_text[3:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
        result_text = result_text.strip()
        data = json.loads(result_text)
        generated_questions = data.get("questions", [])
        
        # Ensure we have exactly 10 questions
        if not generated_questions or len(generated_questions) < 10:
            raise ValueError("LLM did not return enough questions")
            
        formatted_questions = []
        for i, q in enumerate(generated_questions[:10]):
            formatted_questions.append({
                "id": i + 1,
                "text": q,
                "time_limit_seconds": 60,
                "type": "technical" if i < 7 else "behavioral"
            })
            
        return formatted_questions
    except Exception as e:
        print(f"Failed to generate questions with AI: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")
