from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, nullable=False, unique=True)
    hashed_password: str
    full_name: Optional[str] = None
    role: str = Field(default="student")  # super_admin, college_admin, faculty, recruiter, student
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    student_profile: Optional["Student"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    faculty_profile: Optional["Faculty"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    recruiter_profile: Optional["Recruiter"] = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})


class College(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    address: Optional[str] = None
    website: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    batches: List["Batch"] = Relationship(back_populates="college")
    students: List["Student"] = Relationship(back_populates="college")
    faculty: List["Faculty"] = Relationship(back_populates="college")


class Batch(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    year: int
    college_id: int = Field(foreign_key="college.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    college: College = Relationship(back_populates="batches")
    students: List["Student"] = Relationship(back_populates="batch")


class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    college_id: int = Field(foreign_key="college.id")
    batch_id: Optional[int] = Field(default=None, foreign_key="batch.id")
    roll_number: Optional[str] = Field(default=None, index=True)
    course: Optional[str] = None
    branch: Optional[str] = None

    # Relationships
    user: User = Relationship(back_populates="student_profile")
    college: College = Relationship(back_populates="students")
    batch: Optional[Batch] = Relationship(back_populates="students")


class Faculty(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    college_id: int = Field(foreign_key="college.id")
    department: Optional[str] = None
    designation: Optional[str] = None

    # Relationships
    user: User = Relationship(back_populates="faculty_profile")
    college: College = Relationship(back_populates="faculty")


class Recruiter(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", unique=True)
    company_name: str
    position: Optional[str] = None

    # Relationships
    user: User = Relationship(back_populates="recruiter_profile")
