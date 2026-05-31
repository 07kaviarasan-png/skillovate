from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    role: str = Field(default="student")
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
