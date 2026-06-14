from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import List, Optional, Any, Dict, Union
import datetime
import json

# --- Helper for parsing JSON strings from SQLite ---
def parse_json_field(v: Any) -> Any:
    if isinstance(v, str):
        try:
            return json.loads(v)
        except json.JSONDecodeError:
            return v
    return v

# --- Profile Schemas ---

class StudentProfileBase(BaseModel):
    roll_number: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[int] = None
    graduation_year: Optional[int] = None
    college_id: int
    resume_url: Optional[str] = None
    skills: Optional[Union[List[str], str]] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfile(StudentProfileBase):
    id: int
    user_id: int

    @field_validator('skills', mode='before')
    @classmethod
    def validate_skills(cls, v):
        return parse_json_field(v)

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
    company_description: Optional[str] = None
    company_website: Optional[str] = None
    company_logo: Optional[str] = None

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

# --- Assessment Schemas ---

class QuestionBase(BaseModel):
    category: str
    question_text: str
    options: Union[List[str], str]
    correct_answer: str
    explanation: Optional[str] = None
    data_presentation: Optional[str] = None

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: int

    @field_validator('options', mode='before')
    @classmethod
    def validate_options(cls, v):
        return parse_json_field(v)

    class Config:
        from_attributes = True

class AssessmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_minutes: int = 60
    passing_score: float = 40.0
    total_questions: int = 20
    difficulty: str = "medium"
    category: Optional[str] = None
    is_published: bool = False
    scheduled_at: Optional[datetime.datetime] = None

class AssessmentCreate(AssessmentBase):
    question_ids: Optional[List[int]] = None

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    passing_score: Optional[float] = None
    total_questions: Optional[int] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None
    scheduled_at: Optional[datetime.datetime] = None

class Assessment(AssessmentBase):
    id: int
    created_at: datetime.datetime
    questions: List[Question] = []

    class Config:
        from_attributes = True

class AssessmentAttemptBase(BaseModel):
    assessment_id: int

class AssessmentAttemptCreate(AssessmentAttemptBase):
    pass

class AssessmentAttemptUpdate(BaseModel):
    responses: Dict[str, str]
    status: str = "completed"

class AssessmentAttempt(AssessmentAttemptBase):
    id: int
    user_id: int
    score: Optional[float] = None
    percentage: Optional[float] = None
    status: str
    responses: Optional[Union[str, Dict]] = None
    results_analysis: Optional[Union[str, Dict]] = None
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    assessment: Assessment

    @field_validator('responses', 'results_analysis', mode='before')
    @classmethod
    def validate_json_fields(cls, v):
        return parse_json_field(v)

    class Config:
        from_attributes = True

# --- Interview Schemas ---

class InterviewSessionBase(BaseModel):
    category: str

class InterviewSessionCreate(InterviewSessionBase):
    pass

class InterviewSessionUpdate(BaseModel):
    responses: List[Dict[str, Any]] # List of {question_id, response, feedback, rating}
    status: str = "completed"
    overall_score: Optional[float] = None
    feedback: Optional[str] = None

class InterviewSession(InterviewSessionBase):
    id: int
    user_id: int
    status: str
    responses: Optional[Union[str, List]] = None
    overall_score: Optional[float] = None
    feedback: Optional[str] = None
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None

    @field_validator('responses', mode='before')
    @classmethod
    def validate_responses(cls, v):
        return parse_json_field(v)

    class Config:
        from_attributes = True

# --- Placement Schemas ---

class JobBase(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: str = "Full-time"
    college_id: Optional[int] = None
    deadline: Optional[datetime.datetime] = None
    is_active: bool = True

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    college_id: Optional[int] = None
    deadline: Optional[datetime.datetime] = None
    is_active: Optional[bool] = None

class Job(JobBase):
    id: int
    recruiter_id: int
    created_at: datetime.datetime
    recruiter: RecruiterProfile

    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    job_id: int
    resume_url: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    recruiter_notes: Optional[str] = None
    interview_date: Optional[datetime.datetime] = None

class Application(ApplicationBase):
    id: int
    user_id: int
    status: str
    recruiter_notes: Optional[str] = None
    interview_date: Optional[datetime.datetime] = None
    applied_at: datetime.datetime
    updated_at: datetime.datetime
    job: Job
    user: User

    class Config:
        from_attributes = True

# --- Existing Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

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
