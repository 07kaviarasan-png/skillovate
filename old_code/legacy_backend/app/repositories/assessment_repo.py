from typing import List, Optional, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Assessment, AssessmentAttempt, Question
from app.schemas import AssessmentCreate, AssessmentUpdate, AssessmentAttemptCreate, AssessmentAttemptUpdate
from app.repositories.base import BaseRepository

class AssessmentRepository(BaseRepository[Assessment, AssessmentCreate, AssessmentUpdate]):
    def create(self, db: Session, *, obj_in: AssessmentCreate) -> Assessment:
        obj_in_data = obj_in.model_dump(exclude={"question_ids"})
        db_obj = Assessment(**obj_in_data)
        
        if obj_in.question_ids:
            questions = db.query(Question).filter(Question.id.in_(obj_in.question_ids)).all()
            db_obj.questions = questions
        else:
            # Randomly select questions if none provided, up to total_questions
            category_filter = []
            if obj_in.category:
                category_filter.append(Question.category == obj_in.category)
            
            questions = db.query(Question).filter(*category_filter).order_by(func.random()).limit(obj_in.total_questions).all()
            db_obj.questions = questions
            db_obj.total_questions = len(questions)

        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

class AssessmentAttemptRepository(BaseRepository[AssessmentAttempt, AssessmentAttemptCreate, AssessmentAttemptUpdate]):
    def create_with_user(self, db: Session, *, obj_in: AssessmentAttemptCreate, user_id: int) -> AssessmentAttempt:
        db_obj = AssessmentAttempt(
            user_id=user_id,
            assessment_id=obj_in.assessment_id,
            status="started"
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

assessment_repo = AssessmentRepository(Assessment)
assessment_attempt_repo = AssessmentAttemptRepository(AssessmentAttempt)
