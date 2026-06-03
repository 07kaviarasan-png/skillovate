from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from .. import schemas, crud, database, auth, models

router = APIRouter(prefix="/batches", tags=["batches"])


@router.get("/", response_model=schemas.PaginatedResponse)
def list_batches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.any_user)
):
    batches = crud.get_multi(db, models.Batch, skip=skip, limit=limit)
    total = crud.count_multi(db, models.Batch)
    return {"total": total, "items": batches}


@router.post("/", response_model=schemas.BatchRead, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch_in: schemas.BatchCreate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.admin_only)
):
    return crud.create_batch(db, batch_in=batch_in)


@router.get("/{batch_id}", response_model=schemas.BatchRead)
def read_batch(
    batch_id: int,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.any_user)
):
    batch = crud.get_by_id(db, models.Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.patch("/{batch_id}", response_model=schemas.BatchRead)
def update_batch(
    batch_id: int,
    batch_in: schemas.BatchUpdate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.admin_only)
):
    batch = crud.get_by_id(db, models.Batch, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return crud.update_object(db, db_obj=batch, obj_in=batch_in)


@router.delete("/{batch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_batch(
    batch_id: int,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.admin_only)
):
    if not crud.delete_object(db, models.Batch, batch_id):
        raise HTTPException(status_code=404, detail="Batch not found")
    return None
