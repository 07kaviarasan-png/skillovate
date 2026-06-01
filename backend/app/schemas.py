from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
import datetime

# --- Profile Schemas ---

class StudentProfileBase(BaseModel):
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[int] = None
    graduation_year: Optional[int] = None
    college_id: int

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfile(StudentProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class FacultyProfileBase(BaseModel):
    department: Optional[str] = None
    designation: Optional[str] = None
    college_id: int

class FacultyProfileCreate(FacultyProfileBase):
    pass

class FacultyProfile(FacultyProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class RecruiterProfileBase(BaseModel):
    company_name: Optional[str] = None

class RecruiterProfileCreate(RecruiterProfileBase):
    pass

class RecruiterProfile(RecruiterProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# --- User Schemas ---

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "student"
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str
    # Optional profile data can be passed during creation
    student_profile: Optional[StudentProfileCreate] = None
    faculty_profile: Optional[FacultyProfileCreate] = None
    recruiter_profile: Optional[RecruiterProfileCreate] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    created_at: datetime.datetime
    student_profile: Optional[StudentProfile] = None
    faculty_profile: Optional[FacultyProfile] = None
    recruiter_profile: Optional[RecruiterProfile] = None

    class Config:
        from_attributes = True

# --- Token Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# --- College Schemas ---

class CollegeBase(BaseModel):
    name: str
    code: str
    address: Optional[str] = None
    is_active: Optional[bool] = True

class CollegeCreate(CollegeBase):
    pass

class CollegeUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class College(CollegeBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Batch Schemas ---

class BatchBase(BaseModel):
    name: str
    academic_year: Optional[str] = None
    college_id: int
    faculty_id: Optional[int] = None

class BatchCreate(BatchBase):
    pass

class BatchUpdate(BaseModel):
    name: Optional[str] = None
    academic_year: Optional[str] = None
    faculty_id: Optional[int] = None

class Batch(BatchBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Question Schemas ---

class QuestionBase(BaseModel):
    category: str
    question_text: str
    options: List[str]
    correct_answer: str
    explanation: Optional[str] = None
    data_presentation: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int

    class Config:
        from_attributes = True

# --- MNC Schemas ---

class MNCBase(BaseModel):
    name: str
    short_name: str
    logo_url: Optional[str] = None
    sections: int
    test_time_minutes: int
    num_questions: int
    question_bank_size: str
    note: Optional[str] = None

class MNCCreate(MNCBase):
    pass

class MNC(MNCBase):
    id: int

    class Config:
        from_attributes = True

# --- JobRole Schemas ---

class JobRoleBase(BaseModel):
    name: str
    category: str
    icon: Optional[str] = None
    num_questions_estimate: str

class JobRoleCreate(JobRoleBase):
    pass

class JobRole(JobRoleBase):
    id: int

    class Config:
        from_attributes = True
