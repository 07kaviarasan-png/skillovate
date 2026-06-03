from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services.batch_service import batch_service
from app.services.institution_service import institution_service
from app.core.rbac import RoleChecker
from pydantic import BaseModel

router = APIRouter(
    prefix="/batches",
    tags=["batches"],
)

class PaginatedBatches(BaseModel):
    total: int
    items: List[schemas.Batch]

@router.post("/", response_model=schemas.Batch, dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def create_batch(
    *,
    db: Session = Depends(get_db),
    batch_in: schemas.BatchCreate
):
    return batch_service.create_batch(db, batch_in=batch_in)

@router.get("/", response_model=PaginatedBatches)
def read_batches(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    items, total = batch_service.get_batches(db, skip=skip, limit=limit)
    return {"total": total, "items": items}

@router.get("/{batch_id}", response_model=schemas.Batch)
def read_batch_by_id(
    batch_id: int,
    db: Session = Depends(get_db),
):
    batch = batch_service.get_batch(db, batch_id=batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch

@router.post("/{batch_id}/students/{student_id}", status_code=status.HTTP_200_OK, dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def assign_student_to_batch(
    batch_id: int,
    student_id: int,
    db: Session = Depends(get_db)
):
    success = institution_service.assign_student_to_batch(db, student_id=student_id, batch_id=batch_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student or Batch not found")
    return {"message": "Student assigned to batch"}

@router.delete("/{batch_id}/students/{student_id}", status_code=status.HTTP_200_OK, dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def remove_student_from_batch(
    batch_id: int,
    student_id: int,
    db: Session = Depends(get_db)
):
    success = institution_service.remove_student_from_batch(db, student_id=student_id, batch_id=batch_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student or Batch not found")
    return {"message": "Student removed from batch"}

@router.get("/{batch_id}/students", response_model=List[schemas.StudentProfile], dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def get_batch_students(
    batch_id: int,
    db: Session = Depends(get_db)
):
    return institution_service.get_batch_students(db, batch_id=batch_id)

@router.put("/{batch_id}", response_model=schemas.Batch, dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def update_batch(
    *,
    db: Session = Depends(get_db),
    batch_id: int,
    batch_in: schemas.BatchUpdate
):
    batch = batch_service.update_batch(db, batch_id=batch_id, batch_in=batch_in)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch

@router.delete("/{batch_id}", response_model=schemas.Batch, dependencies=[Depends(RoleChecker(["super_admin", "college_admin"]))])
def delete_batch(
    *,
    db: Session = Depends(get_db),
    batch_id: int
):
    batch = batch_service.delete_batch(db, batch_id=batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch
