from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.placement import JobPosting
from app.models.user import User
from app.core.rbac import get_current_user, require_roles, UserRole
from app.schemas.placement import JobPostingCreateRequest, JobPostingResponse

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.get("", response_model=list[JobPostingResponse])
def get_jobs(db: Session = Depends(get_db)):
    """Get all active job postings."""
    # For HR, they might only want to see their own. For now, let's return all.
    return db.query(JobPosting).filter(JobPosting.is_active == True).all()

@router.get("/me", response_model=list[JobPostingResponse])
def get_my_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get jobs posted by the current HR/Recruiter."""
    return db.query(JobPosting).filter(JobPosting.recruiter_id == current_user.id).all()

@router.post("", response_model=JobPostingResponse)
def create_job(
    job_data: JobPostingCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Post a new job vacancy."""
    if current_user.role not in ["hr", "recruiter"]:
        raise HTTPException(status_code=403, detail="Only recruiters can post jobs")
    
    new_job = JobPosting(
        recruiter_id=current_user.id,
        college_id=job_data.college_id,
        title=job_data.title,
        description=job_data.description,
        company_name=job_data.company_name or current_user.company_name,
        location=job_data.location,
        job_type=job_data.job_type,
        salary_min_lpa=job_data.salary_min_lpa,
        salary_max_lpa=job_data.salary_max_lpa,
        required_skills=job_data.required_skills,
        eligible_departments=job_data.eligible_departments,
        eligible_years=job_data.eligible_years,
        min_cgpa=job_data.min_cgpa,
        application_deadline=job_data.application_deadline,
        status="active",
        is_active=True
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job
