from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import User, StudentProfile, FacultyProfile, College, Job, Application, AssessmentAttempt, InterviewSession, Batch

class DashboardService:
    def get_student_stats(self, db: Session, user_id: int) -> Dict[str, Any]:
        # Assessment avg
        avg_score = db.query(func.avg(AssessmentAttempt.percentage)).filter(AssessmentAttempt.user_id == user_id, AssessmentAttempt.status == "completed").scalar() or 0
        
        # Interview avg
        avg_interview = db.query(func.avg(InterviewSession.overall_score)).filter(InterviewSession.user_id == user_id, InterviewSession.status == "completed").scalar() or 0
        
        # Applications count
        apps_count = db.query(func.count(Application.id)).filter(Application.user_id == user_id).scalar()
        
        # Recent activity (mix of assessments and interviews)
        recent_assessments = db.query(AssessmentAttempt).filter(AssessmentAttempt.user_id == user_id).order_by(AssessmentAttempt.started_at.desc()).limit(3).all()
        
        return {
            "average_assessment_score": float(avg_score),
            "average_interview_score": float(avg_interview),
            "total_applications": apps_count,
            "recent_activity": recent_assessments
        }

    def get_college_stats(self, db: Session, college_id: int) -> Dict[str, Any]:
        student_count = db.query(func.count(StudentProfile.id)).filter(StudentProfile.college_id == college_id).scalar()
        faculty_count = db.query(func.count(FacultyProfile.id)).filter(FacultyProfile.college_id == college_id).scalar()
        batch_count = db.query(func.count(Batch.id)).filter(Batch.college_id == college_id).scalar()
        
        # Placement rate
        total_students = student_count or 1
        placed_students = db.query(func.count(func.distinct(Application.user_id))).join(StudentProfile, StudentProfile.user_id == Application.user_id).filter(
            StudentProfile.college_id == college_id,
            Application.status.in_(["Selected", "Offer Released"])
        ).scalar()
        
        return {
            "student_count": student_count,
            "faculty_count": faculty_count,
            "batch_count": batch_count,
            "placement_rate": (placed_students / total_students) * 100
        }

    def get_recruiter_stats(self, db: Session, recruiter_id: int) -> Dict[str, Any]:
        job_ids = [j.id for j in db.query(Job).filter(Job.recruiter_id == recruiter_id).all()]
        total_applicants = db.query(func.count(Application.id)).filter(Application.job_id.in_(job_ids)).scalar()
        open_jobs = db.query(func.count(Job.id)).filter(Job.recruiter_id == recruiter_id, Job.is_active == True).scalar()
        
        return {
            "open_jobs": open_jobs,
            "total_applicants": total_applicants,
            "shortlisted_count": db.query(func.count(Application.id)).filter(Application.job_id.in_(job_ids), Application.status == "Shortlisted").scalar()
        }

    def get_admin_stats(self, db: Session) -> Dict[str, Any]:
        return {
            "total_users": db.query(func.count(User.id)).scalar(),
            "total_colleges": db.query(func.count(College.id)).scalar(),
            "total_jobs": db.query(func.count(Job.id)).scalar(),
            "total_placements": db.query(func.count(Application.id)).filter(Application.status == "Offer Released").scalar()
        }

dashboard_service = DashboardService()
