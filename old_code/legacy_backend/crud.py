from typing import Optional, List, Type, TypeVar, Any
from sqlmodel import Session, select, func
from . import models, schemas

T = TypeVar("T", bound=models.SQLModel)


def get_db_session():
    from .database import SessionLocal
    with SessionLocal() as session:
        yield session


# Generic CRUD helpers
def get_by_id(db: Session, model: Type[T], id: Any) -> Optional[T]:
    return db.get(model, id)


def get_multi(db: Session, model: Type[T], skip: int = 0, limit: int = 100) -> List[T]:
    statement = select(model).offset(skip).limit(limit)
    return db.exec(statement).all()


def count_multi(db: Session, model: Type[T]) -> int:
    statement = select(func.count()).select_from(model)
    return db.exec(statement).one()


def update_object(db: Session, db_obj: T, obj_in: Any) -> T:
    obj_data = obj_in.dict(exclude_unset=True)
    for field in obj_data:
        if hasattr(db_obj, field):
            setattr(db_obj, field, obj_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_object(db: Session, model: Type[T], id: Any) -> bool:
    db_obj = db.get(model, id)
    if not db_obj:
        return False
    db.delete(db_obj)
    db.commit()
    return True


# User specific CRUD
def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.email == email)
    return db.exec(statement).first()


def create_user(db: Session, user_in: schemas.UserCreate, hashed_password: str) -> models.User:
    user = models.User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role or "student",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def search_users(db: Session, query: str, skip: int = 0, limit: int = 100) -> List[models.User]:
    statement = select(models.User).where(
        (models.User.email.contains(query)) | (models.User.full_name.contains(query))
    ).offset(skip).limit(limit)
    return db.exec(statement).all()


# College specific CRUD
def create_college(db: Session, college_in: schemas.CollegeCreate) -> models.College:
    college = models.College(**college_in.dict())
    db.add(college)
    db.commit()
    db.refresh(college)
    return college


# Batch specific CRUD
def create_batch(db: Session, batch_in: schemas.BatchCreate) -> models.Batch:
    batch = models.Batch(**batch_in.dict())
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


# Profile specific CRUD
def create_student_profile(db: Session, student_in: schemas.StudentCreate) -> models.Student:
    student = models.Student(**student_in.dict())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def create_faculty_profile(db: Session, faculty_in: schemas.FacultyCreate) -> models.Faculty:
    faculty = models.Faculty(**faculty_in.dict())
    db.add(faculty)
    db.commit()
    db.refresh(faculty)
    return faculty


def create_recruiter_profile(db: Session, recruiter_in: schemas.RecruiterCreate) -> models.Recruiter:
    recruiter = models.Recruiter(**recruiter_in.dict())
    db.add(recruiter)
    db.commit()
    db.refresh(recruiter)
    return recruiter


# Auth specific
def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    from .auth import verify_password
    if not verify_password(password, user.hashed_password):
        return None
    return user
