from typing import List, Optional, Any
from sqlalchemy.orm import Session
from app.models import InterviewSession, Question
from app.schemas import InterviewSessionCreate, InterviewSessionUpdate
from app.repositories.base import BaseRepository

class InterviewRepository(BaseRepository[InterviewSession, InterviewSessionCreate, InterviewSessionUpdate]):
    def create_with_user(self, db: Session, *, obj_in: InterviewSessionCreate, user_id: int) -> InterviewSession:
        db_obj = InterviewSession(
            user_id=user_id,
            category=obj_in.category,
            status="started"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

interview_repo = InterviewRepository(InterviewSession)
