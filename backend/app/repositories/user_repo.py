"""
Skillovate V2 — User Repository
Data access layer for User and related profile models.
"""
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from app.repositories.base import BaseRepository
from app.models.user import User, StudentProfile, FacultyProfile, RecruiterProfile, RefreshToken


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email.lower()).first()

    def get_by_college(self, college_id: int, role: Optional[str] = None, skip: int = 0, limit: int = 100):
        query = self.db.query(User).filter(User.college_id == college_id)
        if role:
            query = query.filter(User.role == role)
        return query.offset(skip).limit(limit).all()

    def get_students_by_college(self, college_id: int, department: Optional[str] = None):
        query = self.db.query(User).filter(
            User.college_id == college_id,
            User.role == "student",
            User.is_active == True,
        )
        if department:
            query = query.filter(User.department == department)
        return query.all()

    def update_last_login(self, user: User) -> User:
        user.last_login_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(user)
        return user

    def email_exists(self, email: str) -> bool:
        return self.db.query(User).filter(User.email == email.lower()).count() > 0


class StudentProfileRepository(BaseRepository[StudentProfile]):
    def __init__(self, db: Session):
        super().__init__(StudentProfile, db)

    def get_by_user_id(self, user_id: int) -> Optional[StudentProfile]:
        return self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, db: Session):
        super().__init__(RefreshToken, db)

    def get_by_jti(self, jti: str) -> Optional[RefreshToken]:
        return self.db.query(RefreshToken).filter(
            RefreshToken.jti == jti,
            RefreshToken.is_revoked == False,
        ).first()

    def revoke_token(self, token: RefreshToken) -> None:
        token.is_revoked = True
        token.revoked_at = datetime.now(timezone.utc)
        self.db.commit()

    def revoke_all_user_tokens(self, user_id: int) -> int:
        count = self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False,
        ).update({
            RefreshToken.is_revoked: True,
            RefreshToken.revoked_at: datetime.now(timezone.utc),
        })
        self.db.commit()
        return count

    def cleanup_expired(self) -> int:
        count = self.db.query(RefreshToken).filter(
            RefreshToken.expires_at < datetime.now(timezone.utc),
        ).delete()
        self.db.commit()
        return count
