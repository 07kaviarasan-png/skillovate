from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.repositories.college_repo import college_repo
from app.models import College
from app.schemas import CollegeCreate, CollegeUpdate

class CollegeService:
    def get_college(self, db: Session, college_id: int) -> Optional[College]:
        return college_repo.get(db, id=college_id)

    def get_colleges(self, db: Session, skip: int = 0, limit: int = 100) -> Tuple[List[College], int]:
        colleges = college_repo.get_multi(db, skip=skip, limit=limit)
        total = college_repo.count(db)
        return colleges, total

    def create_college(self, db: Session, college_in: CollegeCreate) -> College:
        return college_repo.create(db, obj_in=college_in)

    def update_college(self, db: Session, college_id: int, college_in: CollegeUpdate) -> Optional[College]:
        college = college_repo.get(db, id=college_id)
        if not college:
            return None
        return college_repo.update(db, db_obj=college, obj_in=college_in)

    def delete_college(self, db: Session, college_id: int) -> Optional[College]:
        return college_repo.remove(db, id=college_id)

college_service = CollegeService()
