from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json # Import json module

from app import crud, schemas, models # Corrected from 'from .. import crud, schemas'
from app.database import get_db # Corrected from 'from ..database import get_db'
from app.routers.auth import get_current_user # Corrected from 'from .auth import get_current_user'

router = APIRouter(
    prefix="/questions",
    tags=["questions"],
)

@router.get("/", response_model=List[schemas.Question])
def read_all_questions(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    # current_user: schemas.User = Depends(get_current_user) # Uncomment to protect
):
    questions = crud.get_questions(db, skip=skip, limit=limit)
    # Deserialize options from JSON string to list for each question
    for q in questions:
        q.options = json.loads(q.options)
    return questions

@router.get("/{category}", response_model=List[schemas.Question])
def read_questions_by_category(
    category: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    # current_user: schemas.User = Depends(get_current_user) # Uncomment to protect
):
    questions = crud.get_questions_by_category(db, category=category, skip=skip, limit=limit)
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this category")
    # Deserialize options from JSON string to list for each question
    for q in questions:
        q.options = json.loads(q.options)
    return questions

@router.get("/{category}/{question_id}", response_model=schemas.Question)
def read_single_question(
    category: str, question_id: int, db: Session = Depends(get_db),
    # current_user: schemas.User = Depends(get_current_user) # Uncomment to protect
):
    question = db.query(models.Question).filter(
        models.Question.category == category,
        models.Question.id == question_id
    ).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    # Deserialize options from JSON string to list
    question.options = json.loads(question.options)
    return question
