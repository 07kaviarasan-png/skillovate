"""
Skillovate V2 — College Repository
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.college import College, Department


class CollegeRepository(BaseRepository[College]):
    def __init__(self, db: Session):
        super().__init__(College, db)

    def get_by_short_code(self, code: str) -> Optional[College]:
        return self.db.query(College).filter(College.short_code == code.upper()).first()

    def get_active(self, skip: int = 0, limit: int = 100):
        return self.db.query(College).filter(College.is_active == True).offset(skip).limit(limit).all()

    def name_exists(self, name: str) -> bool:
        return self.db.query(College).filter(College.name == name).count() > 0

    def code_exists(self, code: str) -> bool:
        return self.db.query(College).filter(College.short_code == code.upper()).count() > 0


class DepartmentRepository(BaseRepository[Department]):
    def __init__(self, db: Session):
        super().__init__(Department, db)

    def get_by_college(self, college_id: int):
        return self.db.query(Department).filter(
            Department.college_id == college_id,
            Department.is_active == True,
        ).all()
