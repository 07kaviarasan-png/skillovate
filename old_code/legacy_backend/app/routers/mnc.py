from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, schemas # Corrected from 'from .. import crud, schemas'
from app.database import get_db # Corrected from 'from ..database import get_db'
# from app.routers.auth import get_current_user # Corrected from 'from .auth import get_current_user'

router = APIRouter(
    prefix="/mncs",
    tags=["mncs"],
)

@router.get("/", response_model=List[schemas.MNC])
def read_all_mncs(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    # current_user: schemas.User = Depends(get_current_user) # Uncomment to protect
):
    mncs = crud.get_mncs(db, skip=skip, limit=limit)
    return mncs

@router.get("/{mnc_id}", response_model=schemas.MNC)
def read_single_mnc(
    mnc_id: int, db: Session = Depends(get_db),
    # current_user: schemas.User = Depends(get_current_user) # Uncomment to protect
):
    mnc = crud.get_mnc(db, mnc_id=mnc_id)
    if not mnc:
        raise HTTPException(status_code=404, detail="MNC not found")
    return mnc
