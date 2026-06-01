from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session

from .. import schemas, crud, database, auth, models

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=schemas.PaginatedResponse)
def list_users(
    skip: int = 0,
    limit: int = 100,
    query: Optional[str] = None,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.admin_only)
):
    if query:
        users = crud.search_users(db, query=query, skip=skip, limit=limit)
        total = len(users)  # Simplified for search
    else:
        users = crud.get_multi(db, models.User, skip=skip, limit=limit)
        total = crud.count_multi(db, models.User)
    
    return {"total": total, "items": users}


@router.get("/me", response_model=schemas.UserDetailedRead)
def read_user_me(
    current_user: models.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_session)
):
    return current_user


@router.get("/{user_id}", response_model=schemas.UserDetailedRead)
def read_user(
    user_id: int,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.admin_only)
):
    user = crud.get_by_id(db, models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.super_admin_only)
):
    existing = crud.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = auth.get_password_hash(user_in.password)
    return crud.create_user(db, user_in=user_in, hashed_password=hashed_password)


@router.patch("/{user_id}", response_model=schemas.UserRead)
def update_user(
    user_id: int,
    user_in: schemas.UserUpdate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.super_admin_only)
):
    user = crud.get_by_id(db, models.User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_in.password:
        user_in.password = auth.get_password_hash(user_in.password)
        user.hashed_password = user_in.password
        
    return crud.update_object(db, db_obj=user, obj_in=user_in)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.super_admin_only)
):
    if not crud.delete_object(db, models.User, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return None
