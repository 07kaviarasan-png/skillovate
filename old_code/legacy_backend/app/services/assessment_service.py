from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime
import json
from app.repositories.assessment_repo import assessment_repo, assessment_attempt_repo
from app.repositories.question_repo import question_repo
from app.models import Assessment, AssessmentAttempt, Question
from app.schemas import AssessmentCreate, AssessmentUpdate, AssessmentAttemptCreate, AssessmentAttemptUpdate

class AssessmentService:
    def create_assessment(self, db: Session, assessment_in: AssessmentCreate) -> Assessment:
        return assessment_repo.create(db, obj_in=assessment_in)

    def start_attempt(self, db: Session, user_id: int, assessment_id: int) -> AssessmentAttempt:
        attempt_in = AssessmentAttemptCreate(assessment_id=assessment_id)
        return assessment_attempt_repo.create_with_user(db, obj_in=attempt_in, user_id=user_id)

    def submit_attempt(self, db: Session, attempt_id: int, responses: Dict[int, str]) -> AssessmentAttempt:
        attempt = assessment_attempt_repo.get(db, id=attempt_id)
        if not attempt:
            return None
        
        assessment = attempt.assessment
        questions = assessment.questions
        
        score = 0
        total = len(questions)
        analysis = {
            "categories": {},
            "correct": 0,
            "incorrect": 0,
            "skipped": 0
        }
        
        for q in questions:
            q_id_str = str(q.id)
            user_answer = responses.get(q_id_str) or responses.get(q.id)
            
            cat = q.category or "General"
            if cat not in analysis["categories"]:
                analysis["categories"][cat] = {"correct": 0, "total": 0}
            
            analysis["categories"][cat]["total"] += 1
            
            if user_answer == q.correct_answer:
                score += 1
                analysis["correct"] += 1
                analysis["categories"][cat]["correct"] += 1
            elif user_answer is None:
                analysis["skipped"] += 1
            else:
                analysis["incorrect"] += 1
        
        percentage = (score / total * 100) if total > 0 else 0
        
        # Determine strengths and weaknesses
        strengths = []
        weaknesses = []
        for cat, stats in analysis["categories"].items():
            cat_perc = (stats["correct"] / stats["total"] * 100)
            if cat_perc >= 70:
                strengths.append(cat)
            elif cat_perc < 40:
                weaknesses.append(cat)
        
        analysis["strengths"] = strengths
        analysis["weaknesses"] = weaknesses
        
        attempt.score = float(score)
        attempt.percentage = float(percentage)
        attempt.status = "completed"
        attempt.responses = json.dumps(responses)
        attempt.results_analysis = json.dumps(analysis)
        attempt.completed_at = datetime.utcnow()
        
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        return attempt

    def get_user_attempts(self, db: Session, user_id: int) -> List[AssessmentAttempt]:
        return db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == user_id).all()

    def get_leaderboard(self, db: Session, assessment_id: int, limit: int = 10) -> List[AssessmentAttempt]:
        return db.query(AssessmentAttempt).filter(
            AssessmentAttempt.assessment_id == assessment_id,
            AssessmentAttempt.status == "completed"
        ).order_by(AssessmentAttempt.score.desc()).limit(limit).all()

assessment_service = AssessmentService()
