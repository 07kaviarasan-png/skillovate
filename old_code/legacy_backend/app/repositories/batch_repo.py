from typing import List
from sqlalchemy.orm import Session
from app.models import Batch, StudentProfile
from app.schemas import BatchCreate, BatchUpdate
from app.repositories.base import BaseRepository

class BatchRepository(BaseRepository[Batch, BatchCreate, BatchUpdate]):
    def get_by_college(self, db: Session, *, college_id: int, skip: int = 0, limit: int = 100) -> List[Batch]:
        return db.query(Batch).filter(Batch.college_id == college_id).offset(skip).limit(limit).all()

    def add_student_to_batch(self, db: Session, *, batch_id: int, student_id: int) -> Batch:
        batch = self.get(db, id=batch_id)
        student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        if batch and student:
            batch.students.append(student)
            db.add(batch)
            db.commit()
            db.refresh(batch)
        return batch

    def remove_student_from_batch(self, db: Session, *, batch_id: int, student_id: int) -> Batch:
        batch = self.get(db, id=batch_id)
        student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        if batch and student and student in batch.students:
            batch.students.remove(student)
            db.add(batch)
            db.commit()
            db.refresh(batch)
        return batch

batch_repo = BatchRepository(Batch)
