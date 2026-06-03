from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.rbac import UserRole, get_current_user, require_roles
from app.database import get_db
from app.models.college import College, Department
from app.models.user import User
from app.schemas.college import CollegeCreateRequest, CollegeResponse

router = APIRouter(prefix="/colleges", tags=["Colleges"])


@router.get("", response_model=list[CollegeResponse])
def list_colleges(db: Session = Depends(get_db)):
    return db.query(College).filter(College.is_active == True).order_by(College.name.asc()).all()


@router.get("/me", response_model=CollegeResponse)
def current_college(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    college = db.query(College).filter(College.id == current_user.college_id).first()
    return college


@router.post("", response_model=CollegeResponse, dependencies=[require_roles(UserRole.SUPER_ADMIN)])
def create_college(data: CollegeCreateRequest, db: Session = Depends(get_db)):
    college = College(
        name=data.name,
        short_code=data.short_code.upper(),
        location=data.location or "",
        address=data.address or "",
        contact_email=data.contact_email,
        contact_phone=data.contact_phone,
        website=data.website,
    )
    db.add(college)
    db.flush()
    for dept in data.departments:
        db.add(Department(college_id=college.id, name=dept["name"], code=dept["code"]))
    db.commit()
    db.refresh(college)
    return college
