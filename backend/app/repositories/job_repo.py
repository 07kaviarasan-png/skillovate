from typing import List, Optional, Any
from sqlalchemy.orm import Session
from app.models import Job
from app.schemas import JobCreate, JobUpdate
from app.repositories.base import BaseRepository

class JobRepository(BaseRepository[Job, JobCreate, JobUpdate]):
    def create_with_recruiter(self, db: Session, *, obj_in: JobCreate, recruiter_id: int) -> Job:
        obj_in_data = obj_in.model_dump()
        db_obj = Job(**obj_in_data, recruiter_id=recruiter_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_college(self, db: Session, *, college_id: int, skip: int = 0, limit: int = 100) -> List[Job]:
        return db.query(Job).filter(
            (Job.college_id == college_id) | (Job.college_id == None),
            Job.is_active == True
        ).offset(skip).limit(limit).all()

job_repo = JobRepository(Job)
