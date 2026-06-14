from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import College
from app.schemas import CollegeCreate, CollegeUpdate
from app.repositories.base import BaseRepository

class CollegeRepository(BaseRepository[College, CollegeCreate, CollegeUpdate]):
    def get_by_code(self, db: Session, *, code: str) -> Optional[College]:
        return db.query(College).filter(College.code == code).first()

    def search(self, db: Session, query: str, skip: int = 0, limit: int = 100) -> List[College]:
        return db.query(College).filter(
            (College.name.contains(query)) | (College.code.contains(query))
        ).offset(skip).limit(limit).all()

college_repo = CollegeRepository(College)
