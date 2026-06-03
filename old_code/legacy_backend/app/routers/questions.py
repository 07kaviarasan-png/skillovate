from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.repositories.question_repo import question_repo
from app.core.rbac import RoleChecker

router = APIRouter(
    prefix="/questions",
    tags=["questions"],
)

@router.get("/", response_model=List[schemas.Question], dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def read_questions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None
):
    if category:
        return db.query(question_repo.model).filter(question_repo.model.category == category).offset(skip).limit(limit).all()
    return question_repo.get_multi(db, skip=skip, limit=limit)

@router.get("/categories", response_model=List[str])
def get_question_categories(
    db: Session = Depends(get_db)
):
    return question_repo.get_categories(db)

@router.post("/", response_model=schemas.Question, dependencies=[Depends(RoleChecker(["super_admin"]))])
def create_question(
    *,
    db: Session = Depends(get_db),
    question_in: schemas.QuestionCreate
):
    return question_repo.create(db, obj_in=question_in)

@router.get("/{question_id}", response_model=schemas.Question)
def read_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    question = question_repo.get(db, id=question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question
