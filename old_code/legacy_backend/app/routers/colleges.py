from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services.college_service import college_service
from app.services.institution_service import institution_service
from app.core.rbac import RoleChecker
from pydantic import BaseModel

router = APIRouter(
    prefix="/colleges",
    tags=["colleges"],
)

class PaginatedColleges(BaseModel):
    total: int
    items: List[schemas.College]

@router.post("/", response_model=schemas.College, dependencies=[Depends(RoleChecker(["super_admin"]))])
def create_college(
    *,
    db: Session = Depends(get_db),
    college_in: schemas.CollegeCreate
):
    return college_service.create_college(db, college_in=college_in)

@router.get("/", response_model=PaginatedColleges)
def read_colleges(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    items, total = college_service.get_colleges(db, skip=skip, limit=limit)
    return {"total": total, "items": items}

@router.get("/{college_id}", response_model=schemas.College)
def read_college_by_id(
    college_id: int,
    db: Session = Depends(get_db),
):
    college = college_service.get_college(db, college_id=college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return college

@router.get("/{college_id}/students", response_model=List[schemas.StudentProfile], dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def get_college_students(
    college_id: int,
    db: Session = Depends(get_db)
):
    return institution_service.get_college_students(db, college_id=college_id)

@router.get("/{college_id}/faculty", response_model=List[schemas.FacultyProfile], dependencies=[Depends(RoleChecker(["super_admin", "college_admin"]))])
def get_college_faculty(
    college_id: int,
    db: Session = Depends(get_db)
):
    return institution_service.get_college_faculty(db, college_id=college_id)

@router.put("/{college_id}", response_model=schemas.College, dependencies=[Depends(RoleChecker(["super_admin", "college_admin"]))])
def update_college(
    *,
    db: Session = Depends(get_db),
    college_id: int,
    college_in: schemas.CollegeUpdate
):
    college = college_service.update_college(db, college_id=college_id, college_in=college_in)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return college

@router.delete("/{college_id}", response_model=schemas.College, dependencies=[Depends(RoleChecker(["super_admin"]))])
def delete_college(
    *,
    db: Session = Depends(get_db),
    college_id: int
):
    college = college_service.delete_college(db, college_id=college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return college
