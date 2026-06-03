from sqlalchemy.orm import Session
from app import models, schemas
import bcrypt
import json

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode('utf-8')
    # If hashed_password is a string (from DB), encode it to bytes
    if isinstance(hashed_password, str):
        hashed_password_bytes = hashed_password.encode('utf-8')
    else:
        hashed_password_bytes = hashed_password
    
    try:
        return bcrypt.checkpw(password_bytes, hashed_password_bytes)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

# Question CRUD operations
def get_questions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Question).offset(skip).limit(limit).all()

def get_question(db: Session, question_id: int):
    return db.query(models.Question).filter(models.Question.id == question_id).first()

def create_question(db: Session, question: schemas.QuestionCreate):
    db_question = models.Question(
        category=question.category,
        question_text=question.question_text,
        options=json.dumps(question.options),
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
