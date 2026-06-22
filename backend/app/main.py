from fastapi import FastAPI

from app.db.database import Base, engine
from app.api.auth import router as auth_router
import app.models.user
from app.api.users import router as users_router



app = FastAPI(
    title="Leela API",
    version="0.1.0",
)

app.include_router(auth_router)
app.include_router(users_router)


@app.get("/")
def root():
    return {
        "message": "Leela Backend Running"
    }