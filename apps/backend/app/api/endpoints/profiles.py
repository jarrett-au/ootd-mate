from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from prisma import Prisma
from enum import Enum
import json

router = APIRouter(prefix="/api/profile", tags=["profile"])

# Enums
class StyleOption(str, Enum):
    CASUAL = "casual"
    FORMAL = "formal"
    MINIMALIST = "minimalist"
    BOHEMIAN = "bohemian"
    STREETWEAR = "streetwear"
    PREPPY = "preppy"
    ATHLETIC = "athletic"


class OccasionOption(str, Enum):
    WORK = "work"
    DATE = "date"
    CASUAL = "casual"
    EVENTS_FORMAL = "events/formal"
    ATHLETIC = "athletic"


# Schemas
class ProfileCreate(BaseModel):
    height: Optional[int] = Field(None, ge=100, le=250, description="Height in centimeters")
    weight: Optional[float] = Field(None, ge=30, le=200, description="Weight in kilograms")
    primary_style: Optional[StyleOption] = None
    secondary_style: Optional[StyleOption] = None
    occasions: Optional[List[OccasionOption]] = Field(default_factory=list, max_length=10)

    @field_validator('secondary_style')
    @classmethod
    def validate_secondary_style(cls, v, info):
        if v is not None and info.data.get('primary_style') is None:
            raise ValueError('primary_style must be set if secondary_style is provided')
        if v is not None and v == info.data.get('primary_style'):
            raise ValueError('secondary_style must be different from primary_style')
        return v


class ProfileResponse(BaseModel):
    id: str
    userId: str
    height: Optional[int]
    weight: Optional[float]
    primaryStyle: Optional[str]
    secondaryStyle: Optional[str]
    occasions: Optional[List[str]]
    createdAt: str
    updatedAt: str

    @classmethod
    def from_db(cls, profile):
        """Convert Prisma profile to response model"""
        occasions = None
        if profile.occasions:
            try:
                occasions = json.loads(profile.occasions)
            except:
                occasions = []

        return cls(
            id=profile.id,
            userId=profile.userId,
            height=profile.height,
            weight=profile.weight,
            primaryStyle=profile.primaryStyle,
            secondaryStyle=profile.secondaryStyle,
            occasions=occasions,
            createdAt=profile.createdAt.isoformat(),
            updatedAt=profile.updatedAt.isoformat(),
        )


# Dependency
async def get_prisma():
    """Get Prisma client instance"""
    prisma = Prisma()
    await prisma.connect()
    try:
        yield prisma
    finally:
        await prisma.disconnect()


# Temporary: Get user ID from header (in production, use JWT auth)
async def get_current_user_id() -> str:
    """
    Get current user ID from request.
    TODO: Replace with actual JWT authentication from Task 1
    For now, use a default user ID for testing
    """
    # This is a placeholder - in production, decode JWT token
    return "default-user-id"


@router.get("/", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
async def get_profile(
    prisma: Prisma = Depends(get_prisma),
    user_id: str = Depends(get_current_user_id)
):
    """Get current user's profile"""
    profile = await prisma.profile.find_unique(
        where={"userId": user_id}
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return ProfileResponse.from_db(profile)


@router.put("/", response_model=ProfileResponse, status_code=status.HTTP_200_OK)
async def update_profile(
    profile_data: ProfileCreate,
    prisma: Prisma = Depends(get_prisma),
    user_id: str = Depends(get_current_user_id)
):
    """Update or create current user's profile"""
    # Check if user exists
    user = await prisma.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Convert occasions list to JSON string
    occasions_json = None
    if profile_data.occasions:
        occasions_json = json.dumps([o.value for o in profile_data.occasions])

    # Check if profile exists
    existing_profile = await prisma.profile.find_unique(
        where={"userId": user_id}
    )

    if existing_profile:
        # Update existing profile
        profile = await prisma.profile.update(
            where={"userId": user_id},
            data={
                "height": profile_data.height,
                "weight": profile_data.weight,
                "primaryStyle": profile_data.primary_style.value if profile_data.primary_style else None,
                "secondaryStyle": profile_data.secondary_style.value if profile_data.secondary_style else None,
                "occasions": occasions_json,
            }
        )
    else:
        # Create new profile
        profile = await prisma.profile.create(
            data={
                "userId": user_id,
                "height": profile_data.height,
                "weight": profile_data.weight,
                "primaryStyle": profile_data.primary_style.value if profile_data.primary_style else None,
                "secondaryStyle": profile_data.secondary_style.value if profile_data.secondary_style else None,
                "occasions": occasions_json,
            }
        )

    return ProfileResponse.from_db(profile)
