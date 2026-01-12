from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import api_router
from app.api.endpoints import profiles

app = FastAPI(title="OOTD Mate API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router (includes auth endpoints from Task 1)
app.include_router(api_router, prefix="/api")

# Include profiles router (from Task 2)
app.include_router(profiles.router)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "OOTD Mate API"}
