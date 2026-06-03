from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from .. import schemas, crud, database, auth, models

router = APIRouter(prefix="/colleges", tags=["colleges"])


@router.get("/", response_model=schemas.PaginatedResponse)
def list_colleges(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.any_user)
):
    colleges = crud.get_multi(db, models.College, skip=skip, limit=limit)
    total = crud.count_multi(db, models.College)
    return {"total": total, "items": colleges}


@router.post("/", response_model=schemas.CollegeRead, status_code=status.HTTP_201_CREATED)
def create_college(
    college_in: schemas.CollegeCreate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.super_admin_only)
):
    return crud.create_college(db, college_in=college_in)


@router.get("/{college_id}", response_model=schemas.CollegeDetailedRead)
def read_college(
    college_id: int,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.any_user)
):
    college = crud.get_by_id(db, models.College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return college


@router.patch("/{college_id}", response_model=schemas.CollegeRead)
def update_college(
    college_id: int,
    college_in: schemas.CollegeUpdate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.super_admin_only)
):
    college = crud.get_by_id(db, models.College, college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return crud.update_object(db, db_obj=college, obj_in=college_in)


@router.delete("/{college_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_college(
    college_id: int,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.super_admin_only)
):
    if not crud.delete_object(db, models.College, college_id):
        raise HTTPException(status_code=404, detail="College not found")
    return None
