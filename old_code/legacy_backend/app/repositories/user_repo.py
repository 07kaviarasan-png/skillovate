from typing import Optional, List
from sqlalchemy.orm import Session
from app.models import User, StudentProfile, FacultyProfile, RecruiterProfile
from app.schemas import UserCreate, UserUpdate
from app.repositories.base import BaseRepository
from app.crud import get_password_hash

class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
            role=obj_in.role,
            is_active=obj_in.is_active
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        # Create associated profile based on role
        if obj_in.role == "student" and obj_in.student_profile:
            profile_data = obj_in.student_profile.model_dump()
            profile = StudentProfile(**profile_data, user_id=db_obj.id)
            db.add(profile)
        elif obj_in.role == "faculty" and obj_in.faculty_profile:
            profile_data = obj_in.faculty_profile.model_dump()
            profile = FacultyProfile(**profile_data, user_id=db_obj.id)
            db.add(profile)
        elif obj_in.role == "recruiter" and obj_in.recruiter_profile:
            profile_data = obj_in.recruiter_profile.model_dump()
            profile = RecruiterProfile(**profile_data, user_id=db_obj.id)
            db.add(profile)
        
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def search(self, db: Session, query: str, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).filter(
            (User.username.contains(query)) | (User.email.contains(query))
        ).offset(skip).limit(limit).all()

user_repo = UserRepository(User)
