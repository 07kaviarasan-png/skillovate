from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db
from app.core.rbac import get_current_user, RoleChecker, UserRole
from app.models.user import User
from app.schemas.user import UserResponse, AdminUserUpdateRequest, AdminUserCreateRequest
from app.core.exceptions import NotFoundError
from app.core.security import hash_password
from app.models.user import StudentProfile, FacultyProfile, RecruiterProfile

router = APIRouter(prefix="/users", tags=["Users"])
superadmin_checker = RoleChecker([UserRole.SUPER_ADMIN])

@router.post("/", response_model=UserResponse)
def create_user(
    payload: AdminUserCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a user. Superadmin=anyone, College Admin=faculty+students, Faculty=students only."""
    allowed_roles = [UserRole.SUPER_ADMIN.value, UserRole.COLLEGE_ADMIN.value, UserRole.FACULTY.value]
    if current_user.role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Not authorized to create users")
    
    # Faculty can only create students in their own college
    if current_user.role == UserRole.FACULTY.value:
        if payload.role != UserRole.STUDENT.value:
            raise HTTPException(status_code=403, detail="Faculty can only create students")
        payload.college_id = current_user.college_id
        
    # College admin can create faculty + students in their own college
    if current_user.role == UserRole.COLLEGE_ADMIN.value:
        payload.college_id = current_user.college_id
        if payload.role not in [UserRole.STUDENT.value, UserRole.FACULTY.value]:
            raise HTTPException(status_code=403, detail="Can only create students or faculty")
            
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user = User(
        email=payload.email,
        name=payload.name,
        role=payload.role,
        password_hash=hash_password(payload.password),
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
    """Get users. Superadmin sees all. Others see users in their college."""
    query = db.query(User)
    
    if current_user.role != UserRole.SUPER_ADMIN.value:
        if current_user.college_id is None:
            # Standalone users only see themselves
            query = query.filter(User.id == current_user.id)
        else:
            # Institutional users see everyone in their college
            query = query.filter(User.college_id == current_user.college_id)
        # Hide super admins from non-super admins
        query = query.filter(User.role != UserRole.SUPER_ADMIN.value)
        
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
        if current_user.college_id is None:
            query = query.filter(User.id == current_user.id)
        else:
            query = query.filter(User.college_id == current_user.college_id)
        query = query.filter(User.role != UserRole.SUPER_ADMIN.value)
        
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
    current_user: User = Depends(get_current_user)
):
    """Delete a user. Superadmin can delete anyone. College admin can delete their college users."""
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.COLLEGE_ADMIN.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User", str(user_id))
    if current_user.role == UserRole.COLLEGE_ADMIN.value and user.college_id != current_user.college_id:
        raise HTTPException(status_code=403, detail="Can only delete users from your college")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: AdminUserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a user's details. Superadmin or college admin."""
    if current_user.role not in [UserRole.SUPER_ADMIN.value, UserRole.COLLEGE_ADMIN.value]:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundError("User", str(user_id))
    if current_user.role == UserRole.COLLEGE_ADMIN.value and user.college_id != current_user.college_id:
        raise HTTPException(status_code=403, detail="Can only update users from your college")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user

