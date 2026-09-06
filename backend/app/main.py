from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api.auth import router as auth_router
import app.models.user
import app.models.project
from app.api.users import router as users_router
from app.api.projects import router as projects_router
from app.api.tickets import router as tickets_router


app = FastAPI(
    title="Leela API",
    version="0.1.0",
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(tickets_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Leela Backend Running"
    }