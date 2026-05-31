from sqlalchemy.orm import Session
from app import models, schemas # Corrected from 'from . import models, schemas'
from passlib.context import CryptContext
import json

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Question CRUD operations
def get_questions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Question).offset(skip).limit(limit).all()

def get_question(db: Session, question_id: int):
    return db.query(models.Question).filter(models.Question.id == question_id).first()

def get_questions_by_category(db: Session, category: str, skip: int = 0, limit: int = 100):
    return db.query(models.Question).filter(models.Question.category == category).offset(skip).limit(limit).all()

def create_question(db: Session, question: schemas.QuestionCreate):
    db_question = models.Question(
        category=question.category,
        question_text=question.question_text,
        options=json.dumps(question.options), # Store options as JSON string
        correct_answer=question.correct_answer,
        explanation=question.explanation,
        data_presentation=question.data_presentation
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

# MNC CRUD operations
def get_mncs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MNC).offset(skip).limit(limit).all()

def get_mnc(db: Session, mnc_id: int):
    return db.query(models.MNC).filter(models.MNC.id == mnc_id).first()

def create_mnc(db: Session, mnc: schemas.MNCCreate):
    db_mnc = models.MNC(
        name=mnc.name,
        short_name=mnc.short_name,
        logo_url=mnc.logo_url,
        sections=mnc.sections,
        test_time_minutes=mnc.test_time_minutes,
        num_questions=mnc.num_questions,
        question_bank_size=mnc.question_bank_size,
        note=mnc.note
    )
    db.add(db_mnc)
    db.commit()
    db.refresh(db_mnc)
    return db_mnc

# JobRole CRUD operations
def get_job_roles(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.JobRole).offset(skip).limit(limit).all()

def get_job_role(db: Session, job_role_id: int):
    return db.query(models.JobRole).filter(models.JobRole.id == job_role_id).first()

def create_job_role(db: Session, job_role: schemas.JobRoleCreate):
    db_job_role = models.JobRole(
        name=job_role.name,
        category=job_role.category,
        icon=job_role.icon,
        num_questions_estimate=job_role.num_questions_estimate
    )
    db.add(db_job_role)
    db.commit()
    db.refresh(db_job_role)
    return db_job_role

# College CRUD operations
def get_colleges(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.College).offset(skip).limit(limit).all()

def get_college(db: Session, college_id: int):
    return db.query(models.College).filter(models.College.id == college_id).first()

def create_college(db: Session, college: schemas.CollegeCreate):
    db_college = models.College(
        name=college.name,
        code=college.code,
        num_students=college.num_students,
        is_enabled=college.is_enabled
    )
    db.add(db_college)
    db.commit()
    db.refresh(db_college)
    return db_college
