from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
from app.repositories.assessment_repo import assessment_repo
from app.schemas import AssessmentCreate

def seed():
    db = SessionLocal()
    try:
        # Create a general aptitude assessment
        assessment_repo.create(db, obj_in=AssessmentCreate(
            title="General Aptitude Test",
            description="Comprehensive evaluation of quantitative, logical and verbal skills.",
            duration_minutes=30,
            total_questions=15,
            difficulty="medium",
            is_published=True
        ))
        
        # Create a technical assessment
        assessment_repo.create(db, obj_in=AssessmentCreate(
            title="Core Engineering Assessment",
            description="Test your fundamental engineering concepts and technical skills.",
            duration_minutes=45,
            total_questions=20,
            difficulty="hard",
            category="Technical",
            is_published=True
        ))
        
        print("Assessments seeded successfully.")
    except Exception as e:
        print(f"Error seeding assessments: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
