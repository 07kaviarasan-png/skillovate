from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from .. import schemas, crud, database, auth, models

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[schemas.UserRead])
def list_users(skip: int = 0, limit: int = 50, db: Session = Depends(database.get_session), current_user: models.User = Depends(auth.get_current_active_user)):
    if current_user.role not in {"admin", "faculty"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient privileges")
    return crud.get_users(db, skip=skip, limit=limit)


@router.get("/me", response_model=schemas.UserRead)
def read_user_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user
