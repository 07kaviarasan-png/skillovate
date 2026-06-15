from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db
from app.core.rbac import get_current_user, RoleChecker, UserRole
from app.models.user import User
from app.schemas.user import UserResponse, AdminUserUpdateRequest, AdminUserCreateRequest
from app.core.exceptions import NotFoundError
from app.core.security import get_password_hash
from app.models.user import StudentProfile, FacultyProfile, RecruiterProfile

router = APIRouter(prefix="/users", tags=["Users"])
superadmin_checker = RoleChecker([UserRole.SUPER_ADMIN])

@router.post("/", response_model=UserResponse)
def create_user(
    payload: AdminUserCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a user directly. Superadmin can create anyone. College Admin can only create users in their college."""
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.COLLEGE_ADMIN.value]:
        raise HTTPException(status_code=403, detail="Not authorized to create users")
        
    if current_user.role == UserRole.COLLEGE_ADMIN.value:
        if payload.college_id != current_user.college_id:
            raise HTTPException(status_code=403, detail="Can only create users for your own college")
        if payload.role == UserRole.SUPER_ADMIN.value:
            raise HTTPException(status_code=403, detail="Cannot create super admin")
            
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        email=payload.email,
        name=payload.name,
        role=payload.role,
        password_hash=get_password_hash(payload.password),
        status="approved",
        college_id=payload.college_id,
        department=payload.department
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    if user.role == UserRole.STUDENT.value:
        sp = StudentProfile(user_id=user.id, student_id=payload.student_id, year=payload.year)
        db.add(sp)
    elif user.role == UserRole.FACULTY.value:
        fp = FacultyProfile(user_id=user.id, department=payload.department)
        db.add(fp)
    elif user.role == "recruiter":
        rp = RecruiterProfile(user_id=user.id)
        db.add(rp)
        
    db.commit()
    db.refresh(user)
    return user

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users. Superadmin sees all. College Admin sees their college."""
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.COLLEGE_ADMIN.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    query = db.query(User)
    if current_user.role == UserRole.COLLEGE_ADMIN.value:
        query = query.filter(User.college_id == current_user.college_id)
        
    return query.order_by(User.created_at.desc()).all()

@router.get("/pending", response_model=List[UserResponse])
def get_pending_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users with 'pending' status. Superadmin sees all, college admin sees their college."""
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.COLLEGE_ADMIN.value]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    query = db.query(User).filter(User.status == "pending")
    if current_user.role == UserRole.COLLEGE_ADMIN.value:
        query = query.filter(User.college_id == current_user.college_id)
        
    return query.order_by(User.created_at.desc()).all()

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

@router.delete("/{user_id}", response_model=dict)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(superadmin_checker)
):
    """Delete a user entirely. Only accessible by superadmin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User", str(user_id))
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: AdminUserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(superadmin_checker)
):
    """Update a user's details. Only accessible by superadmin."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User", str(user_id))
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user
