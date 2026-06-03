from typing import List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Question
from app.schemas import QuestionCreate
from app.repositories.base import BaseRepository

class QuestionRepository(BaseRepository[Question, QuestionCreate, Any]):
    def get_random_by_category(self, db: Session, *, category: str, limit: int = 10) -> List[Question]:
        return db.query(Question).filter(Question.category == category).order_by(func.random()).limit(limit).all()

    def get_categories(self, db: Session) -> List[str]:
        categories = db.query(Question.category).distinct().all()
        return [c[0] for c in categories]

question_repo = QuestionRepository(Question)
