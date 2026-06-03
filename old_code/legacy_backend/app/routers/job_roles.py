from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas # Corrected from 'from .. import crud, schemas'
from app.database import get_db # Corrected from 'from ..database import get_db'
# from app.routers.auth import get_current_user # Corrected from 'from .auth import get_current_user'

router = APIRouter(
    prefix="/job-roles",
    tags=["job-roles"],
)

@router.get("/", response_model=List[schemas.JobRole])
def read_all_job_roles(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    # current_user: schemas.User = Depends(get_current_user) # Uncomment to protect
):
    job_roles = crud.get_job_roles(db, skip=skip, limit=limit)
    return job_roles

@router.get("/{job_role_id}", response_model=schemas.JobRole)
def read_single_job_role(
    job_role_id: int, db: Session = Depends(get_db),
    # current_user: schemas.User = Depends(get_current_user) # Uncomment to protect
):
    job_role = crud.get_job_role(db, job_role_id=job_role_id)
    if not job_role:
        raise HTTPException(status_code=404, detail="Job Role not found")
    return job_role
