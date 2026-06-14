from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services.assessment_service import assessment_service
from app.repositories.assessment_repo import assessment_repo, assessment_attempt_repo
from app.routers.auth import get_current_user
from app.core.rbac import RoleChecker
from pydantic import BaseModel

router = APIRouter(
    prefix="/assessments",
    tags=["assessments"],
)

class PaginatedAssessments(BaseModel):
    total: int
    items: List[schemas.Assessment]

@router.post("/", response_model=schemas.Assessment, dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def create_assessment(
    *,
    db: Session = Depends(get_db),
    assessment_in: schemas.AssessmentCreate
):
    return assessment_service.create_assessment(db, assessment_in=assessment_in)

@router.get("/", response_model=PaginatedAssessments)
def read_assessments(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    published_only: bool = True
):
    query = db.query(assessment_repo.model)
    if published_only:
        query = query.filter(assessment_repo.model.is_published == True)
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return {"total": total, "items": items}

@router.get("/{assessment_id}", response_model=schemas.Assessment)
def read_assessment(
    assessment_id: int,
    db: Session = Depends(get_db)
):
    assessment = assessment_repo.get(db, id=assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment

@router.post("/{assessment_id}/start", response_model=schemas.AssessmentAttempt)
def start_assessment_attempt(
    assessment_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return assessment_service.start_attempt(db, user_id=current_user.id, assessment_id=assessment_id)

@router.post("/attempts/{attempt_id}/submit", response_model=schemas.AssessmentAttempt)
def submit_assessment_attempt(
    attempt_id: int,
    responses: Dict[str, str], # question_id: selected_option
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    attempt = assessment_attempt_repo.get(db, id=attempt_id)
    if not attempt or attempt.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    return assessment_service.submit_attempt(db, attempt_id=attempt_id, responses=responses)

@router.get("/attempts/me", response_model=List[schemas.AssessmentAttempt])
def read_my_attempts(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return assessment_service.get_user_attempts(db, user_id=current_user.id)

@router.get("/attempts/{attempt_id}", response_model=schemas.AssessmentAttempt)
def read_attempt(
    attempt_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    attempt = assessment_attempt_repo.get(db, id=attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.user_id != current_user.id:
        RoleChecker(["super_admin", "college_admin", "faculty"])(current_user)
        
    return attempt

@router.get("/{assessment_id}/leaderboard", response_model=List[schemas.AssessmentAttempt])
def get_assessment_leaderboard(
    assessment_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    return assessment_service.get_leaderboard(db, assessment_id=assessment_id, limit=limit)
