from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "student"


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserRead


class TokenPayload(BaseModel):
    sub: str
    email: EmailStr
    role: str
