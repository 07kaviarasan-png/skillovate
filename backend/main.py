from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import create_db_and_tables
from .routers import auth, users

app = FastAPI(title="Skillovate API")

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

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def root():
    return {"success": True, "message": "Skillovate backend is running"}
