from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text, ForeignKey, Table, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import json

from app.database import Base

# Many-to-Many relationship between Batches and Students
batch_student = Table(
    "batch_student",
    Base.metadata,
    Column("batch_id", Integer, ForeignKey("batches.id"), primary_key=True),
    Column("student_id", Integer, ForeignKey("student_profiles.id"), primary_key=True),
)

# Many-to-Many for Assessment Questions
assessment_question = Table(
    "assessment_question",
    Base.metadata,
    Column("assessment_id", Integer, ForeignKey("assessments.id"), primary_key=True),
    Column("question_id", Integer, ForeignKey("questions.id"), primary_key=True),
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
    assessment_attempts = relationship("AssessmentAttempt", back_populates="user")
    interview_sessions = relationship("InterviewSession", back_populates="user")

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
    category = Column(String, nullable=False) # Quantitative, Logical, Verbal, DI, Technical, interview
    question_text = Column(Text, nullable=False)
    options = Column(Text, nullable=False) # JSON list
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    data_presentation = Column(Text, nullable=True)

    def set_options(self, options_list):
        self.options = json.dumps(options_list)

    def get_options(self):
        return json.loads(self.options) if self.options else []

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=60)
    passing_score = Column(Float, default=40.0)
    total_questions = Column(Integer, default=20)
    difficulty = Column(String, default="medium") # easy, medium, hard
    category = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    scheduled_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    questions = relationship("Question", secondary=assessment_question)
    attempts = relationship("AssessmentAttempt", back_populates="assessment")

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    score = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)
    status = Column(String, default="started") # started, completed
    responses = Column(Text, nullable=True) # JSON object {question_id: selected_option}
    results_analysis = Column(Text, nullable=True) # JSON object for breakdown
    started_at = Column(TIMESTAMP, server_default=func.now())
    completed_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    user = relationship("User", back_populates="assessment_attempts")
    assessment = relationship("Assessment", back_populates="attempts")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String, nullable=False) # Frontend, Backend, etc.
    status = Column(String, default="started") # started, completed
    responses = Column(Text, nullable=True) # JSON list of {question_id, response, feedback, rating}
    overall_score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    started_at = Column(TIMESTAMP, server_default=func.now())
    completed_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    user = relationship("User", back_populates="interview_sessions")

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
