from typing import List, Optional, Any
from sqlalchemy.orm import Session
from app.repositories.job_repo import job_repo
from app.repositories.application_repo import application_repo
from app.models import Job, Application, User
from app.schemas import JobCreate, JobUpdate, ApplicationCreate, ApplicationUpdate

class PlacementService:
    def create_job(self, db: Session, job_in: JobCreate, recruiter_id: int) -> Job:
        return job_repo.create_with_recruiter(db, obj_in=job_in, recruiter_id=recruiter_id)

    def update_job(self, db: Session, job_id: int, job_in: JobUpdate) -> Optional[Job]:
        job = job_repo.get(db, id=job_id)
        if not job:
            return None
        return job_repo.update(db, db_obj=job, obj_in=job_in)

    def apply_for_job(self, db: Session, application_in: ApplicationCreate, user_id: int) -> Application:
        # Check if already applied
        existing = db.query(Application).filter(
            Application.job_id == application_in.job_id,
            Application.user_id == user_id
        ).first()
        if existing:
            return existing
        return application_repo.create_with_user(db, obj_in=application_in, user_id=user_id)

    def update_application_status(self, db: Session, application_id: int, status_in: ApplicationUpdate) -> Optional[Application]:
        application = application_repo.get(db, id=application_id)
        if not application:
            return None
        return application_repo.update(db, db_obj=application, obj_in=status_in)

    def get_student_applications(self, db: Session, user_id: int) -> List[Application]:
        return application_repo.get_by_user(db, user_id=user_id)

    def get_job_applicants(self, db: Session, job_id: int) -> List[Application]:
        return application_repo.get_by_job(db, job_id=job_id)

    def get_available_jobs(self, db: Session, college_id: Optional[int] = None) -> List[Job]:
        if college_id:
            return job_repo.get_by_college(db, college_id=college_id)
        return job_repo.get_multi(db)

placement_service = PlacementService()
