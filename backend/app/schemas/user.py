"""
Skillovate V2 — User Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    """Full user response."""
    id: int
    email: str
    name: str
    role: str
    college_id: Optional[int] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_email_verified: bool
    status: str
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class StudentProfileResponse(BaseModel):
    """Student profile response."""
    id: int
    user_id: int
    student_id: Optional[str] = None
    year: Optional[int] = None
    semester: Optional[int] = None
    cgpa: Optional[float] = None
    skills: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    tests_completed: int = 0
    avg_accuracy: float = 0.0
    interviews_completed: int = 0
    streak: int = 0
    national_rank: Optional[int] = None
    placement_status: str = "unplaced"

    model_config = {"from_attributes": True}


class UserUpdateRequest(BaseModel):
    """User profile update."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None


class StudentProfileUpdateRequest(BaseModel):
    """Student profile update."""
    student_id: Optional[str] = None
    year: Optional[int] = None

class AdminUserUpdateRequest(BaseModel):
    """Admin update request to manage user attributes directly."""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    status: Optional[str] = None
    semester: Optional[int] = None
    cgpa: Optional[float] = None
    skills: Optional[str] = None
    resume_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
