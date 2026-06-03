from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
import json
from app.repositories.interview_repo import interview_repo
from app.repositories.question_repo import question_repo
from app.models import InterviewSession, Question
from app.schemas import InterviewSessionCreate, InterviewSessionUpdate

class InterviewService:
    def start_session(self, db: Session, user_id: int, category: str) -> Tuple[InterviewSession, List[Question]]:
        session_in = InterviewSessionCreate(category=category)
        session = interview_repo.create_with_user(db, obj_in=session_in, user_id=user_id)
        
        # Fetch relevant questions for the category
        questions = question_repo.get_random_by_category(db, category=category, limit=10)
        # If not enough category specific questions, get from 'interview' general category
        if len(questions) < 5:
            general_qs = question_repo.get_random_by_category(db, category="interview", limit=5)
            questions.extend(general_qs)
            
        return session, questions

    def submit_session(self, db: Session, session_id: int, responses: List[Dict[str, Any]], overall_score: float, feedback: str) -> InterviewSession:
        session = interview_repo.get(db, id=session_id)
        if not session:
            return None
            
        session.responses = json.dumps(responses)
        session.overall_score = overall_score
        session.feedback = feedback
        session.status = "completed"
        session.completed_at = datetime.utcnow()
        
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def get_user_sessions(self, db: Session, user_id: int) -> List[InterviewSession]:
        return db.query(InterviewSession).filter(InterviewSession.user_id == user_id).all()

interview_service = InterviewService()
