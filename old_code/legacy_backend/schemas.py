from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserRead"


class TokenPayload(BaseModel):
    sub: str
    email: EmailStr
    role: str


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "student"


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# College Schemas
class CollegeBase(BaseModel):
    name: str
    address: Optional[str] = None
    website: Optional[str] = None


class CollegeCreate(CollegeBase):
    pass


class CollegeUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None


class CollegeRead(CollegeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Batch Schemas
class BatchBase(BaseModel):
    name: str
    year: int
    college_id: int


class BatchCreate(BatchBase):
    pass


class BatchUpdate(BaseModel):
    name: Optional[str] = None
    year: Optional[int] = None
    college_id: Optional[int] = None


class BatchRead(BatchBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Student Schemas
class StudentBase(BaseModel):
    user_id: int
    college_id: int
    batch_id: Optional[int] = None
    roll_number: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    college_id: Optional[int] = None
    batch_id: Optional[int] = None
    roll_number: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None


class StudentRead(StudentBase):
    id: int

    class Config:
        from_attributes = True


# Faculty Schemas
class FacultyBase(BaseModel):
    user_id: int
    college_id: int
    department: Optional[str] = None
    designation: Optional[str] = None


class FacultyCreate(FacultyBase):
    pass


class FacultyUpdate(BaseModel):
    college_id: Optional[int] = None
    department: Optional[str] = None
    designation: Optional[str] = None


class FacultyRead(FacultyBase):
    id: int

    class Config:
        from_attributes = True


# Recruiter Schemas
class RecruiterBase(BaseModel):
    user_id: int
    company_name: str
    position: Optional[str] = None


class RecruiterCreate(RecruiterBase):
    pass


class RecruiterUpdate(BaseModel):
    company_name: Optional[str] = None
    position: Optional[str] = None


class RecruiterRead(RecruiterBase):
    id: int

    class Config:
        from_attributes = True


# Detailed Reads
class UserDetailedRead(UserRead):
    student_profile: Optional[StudentRead] = None
    faculty_profile: Optional[FacultyRead] = None
    recruiter_profile: Optional[RecruiterRead] = None


class CollegeDetailedRead(CollegeRead):
    batches: List[BatchRead] = []
    # We might not want to list all students/faculty here for performance
    # students: List[StudentRead] = []
    # faculty: List[FacultyRead] = []


# Search/Pagination Schemas
class PaginatedResponse(BaseModel):
    total: int
    items: List[BaseModel]


# Resolve forward refs
Token.update_forward_refs()
