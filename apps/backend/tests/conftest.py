import pytest
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from prisma import Prisma


@pytest.fixture
async def mock_prisma():
    """Mock Prisma client"""
    prisma = AsyncMock()

    # Mock user
    mock_user = MagicMock()
    mock_user.id = "test-user-123"
    mock_user.email = "test@example.com"
    mock_user.name = "Test User"

    # Mock profile
    def create_mock_profile(
        profile_id="profile-123",
        user_id="test-user-123",
        height=170,
        weight=70.5,
        primary_style="casual",
        secondary_style="minimalist",
        occasions='["work", "casual"]',
    ):
        profile = MagicMock()
        profile.id = profile_id
        profile.userId = user_id
        profile.height = height
        profile.weight = weight
        profile.primaryStyle = primary_style
        profile.secondaryStyle = secondary_style
        profile.occasions = occasions
        profile.createdAt = datetime.now()
        profile.updatedAt = datetime.now()
        return profile

    prisma.user.find_unique = AsyncMock(return_value=mock_user)
    prisma.profile.find_unique = AsyncMock(return_value=None)
    prisma.profile.create = AsyncMock(side_effect=create_mock_profile)
    prisma.profile.update = AsyncMock(side_effect=lambda **kwargs: create_mock_profile())
    prisma.connect = AsyncMock()
    prisma.disconnect = AsyncMock()

    return prisma


@pytest.fixture
def test_user_id():
    """Test user ID"""
    return "test-user-123"


@pytest.fixture
def sample_profile_data():
    """Sample profile data for testing"""
    return {
        "height": 175,
        "weight": 68.5,
        "primary_style": "casual",
        "secondary_style": "minimalist",
        "occasions": ["work", "casual", "date"],
    }
