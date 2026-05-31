from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import json

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student", nullable=False) # e.g., 'student', 'faculty', 'admin'
    created_at = Column(TIMESTAMP, server_default=func.now())

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}')>"

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False) # e.g., 'quant', 'logical', 'verbal', 'di', 'mnc', 'interview'
    question_text = Column(Text, nullable=False)
    # Storing options as a JSON string, will parse/serialize in Pydantic models
    options = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False) # Storing the actual answer text
    explanation = Column(Text, nullable=True)
    data_presentation = Column(Text, nullable=True) # For Data Interpretation questions

    def set_options(self, options_list):
        self.options = json.dumps(options_list)

    def get_options(self):
        return json.loads(self.options) if self.options else []

    def __repr__(self):
        return f"<Question(id={self.id}, category='{self.category}', question_text='{self.question_text[:50]}...')>"

class MNC(Base):
    __tablename__ = "mncs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    short_name = Column(String, nullable=False)
    logo_url = Column(String, nullable=True) # Will extract actual URLs
    sections = Column(Integer, nullable=False)
    test_time_minutes = Column(Integer, nullable=False)
    num_questions = Column(Integer, nullable=False)
    question_bank_size = Column(String, nullable=False) # e.g., "800+"
    note = Column(Text, nullable=True)

    def __repr__(self):
        return f"<MNC(name='{self.name}', short_name='{self.short_name}')>"

class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False) # e.g., 'tech', 'commerce'
    icon = Column(String, nullable=True) # Storing icon identifier
    num_questions_estimate = Column(String, nullable=False) # e.g., '320', '∞'

    def __repr__(self):
        return f"<JobRole(name='{self.name}', category='{self.category}')>"

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    num_students = Column(Integer, nullable=False)
    is_enabled = Column(Boolean, nullable=False)

    def __repr__(self):
        return f"<College(name='{self.name}', code='{self.code}')>"
