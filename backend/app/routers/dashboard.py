from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.dashboard_service import dashboard_service
from app.routers.auth import get_current_user
from app import schemas

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
)

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    if current_user.role == "student":
        return dashboard_service.get_student_stats(db, current_user.id)
    elif current_user.role == "college_admin":
        if not current_user.faculty_profile: # Should probably check college_id directly
             raise HTTPException(status_code=400, detail="College Admin profile not found")
        return dashboard_service.get_college_stats(db, current_user.faculty_profile.college_id)
    elif current_user.role == "recruiter":
        if not current_user.recruiter_profile:
             raise HTTPException(status_code=400, detail="Recruiter profile not found")
        return dashboard_service.get_recruiter_stats(db, current_user.recruiter_profile.id)
    elif current_user.role == "super_admin":
        return dashboard_service.get_admin_stats(db)
    
    return {"message": "Stats not available for this role"}
