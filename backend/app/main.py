from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse
from starlette.staticfiles import StaticFiles

from app import models
from app.database import engine
from app.routers import auth, questions, mnc, job_roles, colleges, users, batches, assessments, interviews

# Create all database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Skillovate API",
    description="API for Skillovate AI Aptitude Trainer & Career Intelligence",
    version="1.0.0",
)

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root redirect to docs
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(colleges.router, prefix="/api/v1")
app.include_router(batches.router, prefix="/api/v1")
app.include_router(questions.router, prefix="/api/v1")
app.include_router(assessments.router, prefix="/api/v1")
app.include_router(interviews.router, prefix="/api/v1")
app.include_router(mnc.router, prefix="/api/v1")
app.include_router(job_roles.router, prefix="/api/v1")

# Health check
@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {"status": "healthy", "version": "1.0.0"}
