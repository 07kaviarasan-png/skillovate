from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db
from app.core.rbac import get_current_user, RoleChecker, UserRole
from app.models.user import User
from app.schemas.user import UserResponse
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/users", tags=["Users"])
superadmin_checker = RoleChecker([UserRole.SUPER_ADMIN])

@router.get("/pending", response_model=List[UserResponse])
def get_pending_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(superadmin_checker)
):
    """Get all users with 'pending' status. Only accessible by superadmin."""
    users = db.query(User).filter(User.status == "pending").order_by(User.created_at.desc()).all()
    return users

@router.put("/{user_id}/approve", response_model=UserResponse)
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(superadmin_checker)
):
    """Approve a pending user. Only accessible by superadmin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User", str(user_id))
    user.status = "approved"
    db.commit()
    db.refresh(user)
    return user

@router.put("/{user_id}/reject", response_model=UserResponse)
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(superadmin_checker)
):
    """Reject a pending user. Only accessible by superadmin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User", str(user_id))
    user.status = "rejected"
    db.commit()
    db.refresh(user)
    return user
