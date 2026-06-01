from typing import List, Optional
from sqlalchemy.orm import Session
from app.models import StudentProfile, FacultyProfile, Batch, College
from app.repositories.user_repo import user_repo
from app.repositories.college_repo import college_repo
from app.repositories.batch_repo import batch_repo

class InstitutionService:
    def assign_student_to_batch(self, db: Session, student_id: int, batch_id: int) -> bool:
        student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        
        if not student or not batch:
            return False
            
        if batch not in student.batches:
            student.batches.append(batch)
            db.commit()
        return True

    def remove_student_from_batch(self, db: Session, student_id: int, batch_id: int) -> bool:
        student = db.query(StudentProfile).filter(StudentProfile.id == student_id).first()
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        
        if not student or not batch:
            return False
            
        if batch in student.batches:
            student.batches.remove(batch)
            db.commit()
        return True

    def get_college_students(self, db: Session, college_id: int) -> List[StudentProfile]:
        return db.query(StudentProfile).filter(StudentProfile.college_id == college_id).all()

    def get_college_faculty(self, db: Session, college_id: int) -> List[FacultyProfile]:
        return db.query(FacultyProfile).filter(FacultyProfile.college_id == college_id).all()

    def get_batch_students(self, db: Session, batch_id: int) -> List[StudentProfile]:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        return batch.students if batch else []

institution_service = InstitutionService()
