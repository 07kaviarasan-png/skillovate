from typing import Optional, List
from sqlmodel import Session, select
from . import models, schemas, database


def get_db_session():
    with database.SessionLocal() as session:
        yield session


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    statement = select(models.User).where(models.User.email == email)
    return db.exec(statement).first()


def get_user(db: Session, user_id: int) -> Optional[models.User]:
    return db.get(models.User, user_id)


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    statement = select(models.User).offset(skip).limit(limit)
    return db.exec(statement).all()


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


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    from .auth import verify_password
    if not verify_password(password, user.hashed_password):
        return None
    return user
