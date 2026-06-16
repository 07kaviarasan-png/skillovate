from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.rbac import get_college_scope, get_current_user
from app.database import get_db
from app.models.achievement import Achievement
from app.models.assessment import AssessmentAttempt
from app.models.interview import InterviewAttempt
from app.models.placement import Placement
from app.models.user import User
from app.schemas.achievement import AchievementResponse

router = APIRouter(tags=["Achievements"])


@router.get("/students/{student_id}/achievements", response_model=list[AchievementResponse])
def student_achievements(student_id: int, db: Session = Depends(get_db), college_scope: int | None = get_college_scope):
    query = db.query(Achievement).filter(Achievement.user_id == student_id)
    if college_scope:
        query = query.filter(Achievement.college_id == college_scope)
    return query.order_by(Achievement.achieved_at.desc()).all()


@router.post("/students/{student_id}/achievements/evaluate", response_model=list[AchievementResponse])
def evaluate_achievements(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        return []
    college_id = student.college_id or 1
    created: list[Achievement] = []
    test_count = db.query(AssessmentAttempt).filter(AssessmentAttempt.student_id == student_id, AssessmentAttempt.status == "completed").count()
    interview_count = db.query(InterviewAttempt).filter(InterviewAttempt.student_id == student_id).count()
    placement_count = db.query(Placement).filter(Placement.student_id == student_id).count()
    rules = [
        ("practice-5", test_count >= 5, "Practice Starter", "Completed 5 tests", "test", test_count),
        ("interview-1", interview_count >= 1, "Interview Ready", "Completed a mock interview", "interview", interview_count),
        ("placed", placement_count >= 1, "Placed Talent", "Submitted a placement record", "placement", placement_count),
    ]
    for ach_type, condition, title, desc, module, value in rules:
        exists = db.query(Achievement).filter(Achievement.user_id == student_id, Achievement.achievement_type == ach_type).first()
        if condition and not exists:
            achievement = Achievement(
                user_id=student_id,
                college_id=college_id,
                achievement_type=ach_type,
                title=title,
                description=desc,
                source_module=module,
                metric_value=value,
            )
            db.add(achievement)
            created.append(achievement)
    db.commit()
    return db.query(Achievement).filter(Achievement.user_id == student_id).order_by(Achievement.achieved_at.desc()).all()


@router.get("/leaderboard")
def leaderboard(
    scope: str = "national",
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(User).filter(User.role == "student", User.status == "approved")
    
    if scope == "college":
        query = query.filter(User.college_id == current_user.college_id)
    rows = []
    for user in query.limit(100).all():
        profile = user.student_profile
        # We need a score. Since tests_completed * avg_accuracy * 10 is a good metric
        tests = profile.tests_completed if profile else 0
        acc = profile.avg_accuracy if profile else 0
        score = int(tests * acc * 10)
        # Random trend logic for visual flavor since we don't track historical ranks
        trend = "same"
        if tests > 0:
            trend = "up" if score % 3 == 0 else "down" if score % 2 == 0 else "same"
        rows.append({
            "id": user.id,
            "name": user.name,
            "college": user.college.name if user.college else "Independent",
            "score": score,
            "accuracy": acc,
            "avatar": user.name[0].upper() if user.name else "U",
            "trend": trend,
            "rank": 0,
        })
    # Filter out 0 score users to make it look active, unless there are none
    active_rows = [r for r in rows if r["score"] > 0]
    if not active_rows and rows:
        active_rows = rows # Fallback if all are 0
    active_rows.sort(key=lambda item: item["score"], reverse=True)
    for index, row in enumerate(active_rows, start=1):
        row["rank"] = index
    return {"success": True, "data": active_rows}
