from fastapi import FastAPI
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse
from starlette.staticfiles import StaticFiles

from app import models # Corrected from 'from . import models'
from app.database import engine # Corrected from 'from .database import engine'
from app.routers import auth, questions, mnc, job_roles, colleges # Corrected from 'from .routers import ...'

# Create all database tables (if they don't exist)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Skillovate API",
    description="API for Skillovate AI Aptitude Trainer & Career Intelligence",
    version="1.0.0",
)

# Mount static files to serve frontend assets. This is a placeholder for now.
# Once Next.js is set up, this might change to proxying or separate deployments.
# For now, it allows serving index.html directly from the backend if needed,
# or for serving generated Next.js static output.
app.mount("/static", StaticFiles(directory="../frontend"), name="static")

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(questions.router, prefix="/api/v1")
app.include_router(mnc.router, prefix="/api/v1")
app.include_router(job_roles.router, prefix="/api/v1")
app.include_router(colleges.router, prefix="/api/v1")

@app.get("/")
async def root():
    return RedirectResponse(url="/static/index.html")

@app.get("/api/v1")
async def read_root():
    return {"message": "Welcome to Skillovate API v1"}
