from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import json

Base = declarative_base()

# Many-to-Many relationship between Batches and Students
batch_student = Table(
    "batch_student",
    Base.metadata,
    Column("batch_id", Integer, ForeignKey("batches.id"), primary_key=True),
    Column("student_id", Integer, ForeignKey("student_profiles.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student", nullable=False) # 'super_admin', 'college_admin', 'faculty', 'recruiter', 'student'
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    faculty_profile = relationship("FacultyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recruiter_profile = relationship("RecruiterProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}', role='{self.role}')>"

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    address = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    students = relationship("StudentProfile", back_populates="college")
    faculty = relationship("FacultyProfile", back_populates="college")
    batches = relationship("Batch", back_populates="college")

    def __repr__(self):
        return f"<College(name='{self.name}', code='{self.code}')>"

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    roll_number = Column(String, nullable=True)
    department = Column(String, nullable=True)
    year_of_study = Column(Integer, nullable=True)
    graduation_year = Column(Integer, nullable=True)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    college = relationship("College", back_populates="students")
    batches = relationship("Batch", secondary=batch_student, back_populates="students")

class FacultyProfile(Base):
    __tablename__ = "faculty_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="faculty_profile")
    college = relationship("College", back_populates="faculty")
    managed_batches = relationship("Batch", back_populates="faculty")

class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name = Column(String, nullable=True)

    # Relationships
    user = relationship("User", back_populates="recruiter_profile")

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    college_id = Column(Integer, ForeignKey("colleges.id"), nullable=False)
    faculty_id = Column(Integer, ForeignKey("faculty_profiles.id"), nullable=True)
    academic_year = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    college = relationship("College", back_populates="batches")
    faculty = relationship("FacultyProfile", back_populates="managed_batches")
    students = relationship("StudentProfile", secondary=batch_student, back_populates="batches")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    data_presentation = Column(Text, nullable=True)

    def set_options(self, options_list):
        self.options = json.dumps(options_list)

    def get_options(self):
        return json.loads(self.options) if self.options else []

class MNC(Base):
    __tablename__ = "mncs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    short_name = Column(String, nullable=False)
    logo_url = Column(String, nullable=True)
    sections = Column(Integer, nullable=False)
    test_time_minutes = Column(Integer, nullable=False)
    num_questions = Column(Integer, nullable=False)
    question_bank_size = Column(String, nullable=False)
    note = Column(Text, nullable=True)

class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    icon = Column(String, nullable=True)
    num_questions_estimate = Column(String, nullable=False)
