from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any
import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "student"

class UserInDBBase(UserBase):
    id: int
    created_at: datetime.datetime
    role: str

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Question Schemas
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

# MNC Schemas
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

# JobRole Schemas
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

# College Schemas
class CollegeBase(BaseModel):
    name: str
    code: str
    num_students: int
    is_enabled: bool

class CollegeCreate(CollegeBase):
    pass

class College(CollegeBase):
    id: int

    class Config:
        from_attributes = True
