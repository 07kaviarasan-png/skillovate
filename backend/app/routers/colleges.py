from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas # Corrected from 'from .. import crud, schemas'
from app.database import get_db # Corrected from 'from ..database import get_db'
# from app.routers.auth import get_current_user # Corrected from 'from .auth import get_current_user'

router = APIRouter(
    prefix="/colleges",
    tags=["colleges"],
)

@router.get("/", response_model=List[schemas.College])
def read_all_colleges(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    # current_user: schemas.User = Depends(get_current_user) # Uncomment to protect
):
    colleges = crud.get_colleges(db, skip=skip, limit=limit)
    return colleges

@router.get("/{college_id}", response_model=schemas.College)
def read_single_college(
    college_id: int, db: Session = Depends(get_db),
    # current_user: schemas.User = Depends(get_current_user) # Uncomment to protect
):
    college = crud.get_college(db, college_id=college_id)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    return college
