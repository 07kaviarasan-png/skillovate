from typing import List, Optional, Any
from sqlalchemy.orm import Session
from app.models import Application
from app.schemas import ApplicationCreate, ApplicationUpdate
from app.repositories.base import BaseRepository

class ApplicationRepository(BaseRepository[Application, ApplicationCreate, ApplicationUpdate]):
    def create_with_user(self, db: Session, *, obj_in: ApplicationCreate, user_id: int) -> Application:
        obj_in_data = obj_in.model_dump()
        db_obj = Application(**obj_in_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_user(self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100) -> List[Application]:
        return db.query(Application).filter(Application.user_id == user_id).offset(skip).limit(limit).all()

    def get_by_job(self, db: Session, *, job_id: int, skip: int = 0, limit: int = 100) -> List[Application]:
        return db.query(Application).filter(Application.job_id == job_id).offset(skip).limit(limit).all()

application_repo = ApplicationRepository(Application)
