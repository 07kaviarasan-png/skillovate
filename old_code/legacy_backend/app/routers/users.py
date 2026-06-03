from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services.user_service import user_service
from app.routers.auth import get_current_user
from app.core.rbac import RoleChecker
from pydantic import BaseModel

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

class PaginatedUsers(BaseModel):
    total: int
    items: List[schemas.User]

@router.post("/", response_model=schemas.User, dependencies=[Depends(RoleChecker(["super_admin", "college_admin"]))])
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate
):
    return user_service.create_user(db, user_in=user_in)

@router.get("/", response_model=PaginatedUsers, dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    items, total = user_service.get_users(db, skip=skip, limit=limit)
    return {"total": total, "items": items}

@router.get("/search", response_model=PaginatedUsers, dependencies=[Depends(RoleChecker(["super_admin", "college_admin", "faculty"]))])
def search_users(
    query: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    items, total = user_service.search_users(db, query=query, skip=skip, limit=limit)
    return {"total": total, "items": items}

@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: schemas.User = Depends(get_current_user),
):
    return current_user

@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id(
    user_id: int,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = user_service.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == current_user.id:
        return user
    
    # If not the same user, check permissions
    RoleChecker(["super_admin", "college_admin", "faculty"])(current_user)
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: schemas.User = Depends(get_current_user)
):
    if user_id != current_user.id:
        RoleChecker(["super_admin", "college_admin"])(current_user)
    
    user = user_service.update_user(db, user_id=user_id, user_in=user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", response_model=schemas.User, dependencies=[Depends(RoleChecker(["super_admin"]))])
def delete_user(
    *,
    db: Session = Depends(get_db),
    user_id: int
):
    user = user_service.delete_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
