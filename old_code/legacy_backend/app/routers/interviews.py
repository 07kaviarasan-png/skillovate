from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services.interview_service import interview_service
from app.repositories.interview_repo import interview_repo
from app.routers.auth import get_current_user
from app.core.rbac import RoleChecker
from pydantic import BaseModel

router = APIRouter(
    prefix="/interviews",
    tags=["interviews"],
)

class InterviewStartResponse(BaseModel):
    session: schemas.InterviewSession
    questions: List[schemas.Question]

@router.post("/start", response_model=InterviewStartResponse)
def start_interview_session(
    category: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    session, questions = interview_service.start_session(db, user_id=current_user.id, category=category)
    return {"session": session, "questions": questions}

@router.post("/sessions/{session_id}/submit", response_model=schemas.InterviewSession)
def submit_interview_session(
    session_id: int,
    session_in: schemas.InterviewSessionUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    session = interview_repo.get(db, id=session_id)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
        
    return interview_service.submit_session(
        db, 
        session_id=session_id, 
        responses=session_in.responses,
        overall_score=session_in.overall_score,
        feedback=session_in.feedback
    )

@router.get("/sessions/me", response_model=List[schemas.InterviewSession])
def read_my_sessions(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return interview_service.get_user_sessions(db, user_id=current_user.id)

@router.get("/sessions/{session_id}", response_model=schemas.InterviewSession)
def read_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    session = interview_repo.get(db, id=session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.user_id != current_user.id:
        RoleChecker(["super_admin", "college_admin", "faculty"])(current_user)
        
    return session
