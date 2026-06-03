from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services.placement_service import placement_service
from app.repositories.job_repo import job_repo
from app.repositories.application_repo import application_repo
from app.routers.auth import get_current_user
from app.core.rbac import RoleChecker

router = APIRouter(
    prefix="/placements",
    tags=["placements"],
)

# Jobs
@router.post("/jobs", response_model=schemas.Job, dependencies=[Depends(RoleChecker(["super_admin", "recruiter", "college_admin"]))])
def create_job(
    *,
    db: Session = Depends(get_db),
    job_in: schemas.JobCreate,
    current_user: schemas.User = Depends(get_current_user)
):
    if current_user.role == "recruiter" and not current_user.recruiter_profile:
        raise HTTPException(status_code=400, detail="Recruiter profile not found")
    
    recruiter_id = current_user.recruiter_profile.id if current_user.role == "recruiter" else 1 # Fallback for admin
    return placement_service.create_job(db, job_in=job_in, recruiter_id=recruiter_id)

@router.get("/jobs", response_model=List[schemas.Job])
def read_jobs(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    college_id = current_user.student_profile.college_id if current_user.role == "student" and current_user.student_profile else None
    return placement_service.get_available_jobs(db, college_id=college_id)

@router.get("/jobs/{job_id}", response_model=schemas.Job)
def read_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = job_repo.get(db, id=job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# Applications
@router.post("/apply", response_model=schemas.Application, dependencies=[Depends(RoleChecker(["student"]))])
def apply_for_job(
    *,
    db: Session = Depends(get_db),
    application_in: schemas.ApplicationCreate,
    current_user: schemas.User = Depends(get_current_user)
):
    return placement_service.apply_for_job(db, application_in=application_in, user_id=current_user.id)

@router.get("/applications/me", response_model=List[schemas.Application], dependencies=[Depends(RoleChecker(["student"]))])
def read_my_applications(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_current_user)
):
    return placement_service.get_student_applications(db, user_id=current_user.id)

@router.get("/jobs/{job_id}/applicants", response_model=List[schemas.Application], dependencies=[Depends(RoleChecker(["super_admin", "recruiter", "college_admin"]))])
def read_job_applicants(
    job_id: int,
    db: Session = Depends(get_db)
):
    return placement_service.get_job_applicants(db, job_id=job_id)

@router.patch("/applications/{application_id}", response_model=schemas.Application, dependencies=[Depends(RoleChecker(["super_admin", "recruiter", "college_admin"]))])
def update_application(
    application_id: int,
    application_in: schemas.ApplicationUpdate,
    db: Session = Depends(get_db)
):
    app = placement_service.update_application_status(db, application_id=application_id, status_in=application_in)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app
