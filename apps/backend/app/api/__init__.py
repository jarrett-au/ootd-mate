"""
API router initialization
"""
from fastapi import APIRouter
from app.api.endpoints import auth

api_router = APIRouter()

# Include auth endpoints
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)
