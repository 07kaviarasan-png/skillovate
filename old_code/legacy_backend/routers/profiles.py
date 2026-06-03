from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from .. import schemas, crud, database, auth, models

router = APIRouter(prefix="/profiles", tags=["profiles"])


# Student Profiles
@router.post("/students", response_model=schemas.StudentRead, status_code=status.HTTP_201_CREATED)
def create_student_profile(
    student_in: schemas.StudentCreate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.admin_only)
):
    return crud.create_student_profile(db, student_in=student_in)


@router.patch("/students/{profile_id}", response_model=schemas.StudentRead)
def update_student_profile(
    profile_id: int,
    student_in: schemas.StudentUpdate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.admin_only)
):
    profile = crud.get_by_id(db, models.Student, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return crud.update_object(db, db_obj=profile, obj_in=student_in)


# Faculty Profiles
@router.post("/faculty", response_model=schemas.FacultyRead, status_code=status.HTTP_201_CREATED)
def create_faculty_profile(
    faculty_in: schemas.FacultyCreate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.admin_only)
):
    return crud.create_faculty_profile(db, faculty_in=faculty_in)


@router.patch("/faculty/{profile_id}", response_model=schemas.FacultyRead)
def update_faculty_profile(
    profile_id: int,
    faculty_in: schemas.FacultyUpdate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.admin_only)
):
    profile = crud.get_by_id(db, models.Faculty, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Faculty profile not found")
    return crud.update_object(db, db_obj=profile, obj_in=faculty_in)


# Recruiter Profiles
@router.post("/recruiters", response_model=schemas.RecruiterRead, status_code=status.HTTP_201_CREATED)
def create_recruiter_profile(
    recruiter_in: schemas.RecruiterCreate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.super_admin_only)
):
    return crud.create_recruiter_profile(db, recruiter_in=recruiter_in)


@router.patch("/recruiters/{profile_id}", response_model=schemas.RecruiterRead)
def update_recruiter_profile(
    profile_id: int,
    recruiter_in: schemas.RecruiterUpdate,
    db: Session = Depends(database.get_session),
    current_user: models.User = Depends(auth.super_admin_only)
):
    profile = crud.get_by_id(db, models.Recruiter, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Recruiter profile not found")
    return crud.update_object(db, db_obj=profile, obj_in=recruiter_in)
