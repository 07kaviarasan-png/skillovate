from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class InterviewResponseInput(BaseModel):
    question_text: str
    answer_text: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=10)
    feedback: Optional[str] = None
    time_taken_seconds: Optional[int] = None


class InterviewSubmitRequest(BaseModel):
    role: str
    category: str = "tech"
    overall_rating: Optional[float] = None
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    duration_seconds: Optional[int] = None
    responses: list[InterviewResponseInput] = []


class InterviewAttemptResponse(BaseModel):
    id: int
    student_id: int
    college_id: int
    role: str
    category: str
    overall_rating: Optional[float] = None
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    duration_seconds: Optional[int] = None
    attempt_number: int
    status: str
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
