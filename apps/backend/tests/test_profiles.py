import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from app.main import app
from app.api.endpoints.profiles import ProfileCreate, StyleOption, OccasionOption
import json


@pytest.fixture
def client():
    """Test client for FastAPI app"""
    return TestClient(app)


class TestProfileSchemas:
    """Test Pydantic schemas and validation"""

    def test_valid_profile_create(self):
        """Test creating a valid profile"""
        profile_data = {
            "height": 170,
            "weight": 70.5,
            "primary_style": StyleOption.CASUAL,
            "secondary_style": StyleOption.MINIMALIST,
            "occasions": [OccasionOption.WORK, OccasionOption.CASUAL],
        }
        profile = ProfileCreate(**profile_data)
        assert profile.height == 170
        assert profile.weight == 70.5
        assert profile.primary_style == StyleOption.CASUAL
        assert profile.secondary_style == StyleOption.MINIMALIST
        assert len(profile.occasions) == 2

    def test_profile_with_minimal_data(self):
        """Test creating profile with minimal data"""
        profile = ProfileCreate()
        assert profile.height is None
        assert profile.weight is None
        assert profile.primary_style is None
        assert profile.secondary_style is None
        assert profile.occasions == []

    def test_height_validation_too_low(self):
        """Test height validation - too low"""
        with pytest.raises(ValueError) as exc_info:
            ProfileCreate(height=99)
        assert "height" in str(exc_info.value).lower()

    def test_height_validation_too_high(self):
        """Test height validation - too high"""
        with pytest.raises(ValueError) as exc_info:
            ProfileCreate(height=251)
        assert "height" in str(exc_info.value).lower()

    def test_height_boundary_values(self):
        """Test height boundary values"""
        profile_min = ProfileCreate(height=100)
        assert profile_min.height == 100

        profile_max = ProfileCreate(height=250)
        assert profile_max.height == 250

    def test_weight_validation_too_low(self):
        """Test weight validation - too low"""
        with pytest.raises(ValueError) as exc_info:
            ProfileCreate(weight=29.9)
        assert "weight" in str(exc_info.value).lower()

    def test_weight_validation_too_high(self):
        """Test weight validation - too high"""
        with pytest.raises(ValueError) as exc_info:
            ProfileCreate(weight=200.1)
        assert "weight" in str(exc_info.value).lower()

    def test_weight_boundary_values(self):
        """Test weight boundary values"""
        profile_min = ProfileCreate(weight=30)
        assert profile_min.weight == 30

        profile_max = ProfileCreate(weight=200)
        assert profile_max.weight == 200

    def test_secondary_style_without_primary(self):
        """Test secondary_style without primary_style raises error"""
        with pytest.raises(ValueError) as exc_info:
            ProfileCreate(
                primary_style=None,
                secondary_style=StyleOption.MINIMALIST,
            )
        assert "primary_style" in str(exc_info.value).lower()

    def test_secondary_style_same_as_primary(self):
        """Test secondary_style same as primary_style raises error"""
        with pytest.raises(ValueError) as exc_info:
            ProfileCreate(
                primary_style=StyleOption.CASUAL,
                secondary_style=StyleOption.CASUAL,
            )
        assert "different" in str(exc_info.value).lower() or "same" in str(exc_info.value).lower()

    def test_occasions_exceed_max_length(self):
        """Test occasions list exceeds maximum length"""
        long_occasions_list = [OccasionOption.WORK] * 11
        with pytest.raises(ValueError):
            ProfileCreate(occasions=long_occasions_list)


class TestProfileEndpoints:
    """Test profile API endpoints"""

    def test_get_profile_not_found(self, client, mock_prisma):
        """Test GET /api/profile/ when profile not found"""
        mock_prisma.profile.find_unique = AsyncMock(return_value=None)

        with patch("app.api.endpoints.profiles.get_prisma") as get_prisma_mock:
            get_prisma_mock.return_value = mock_prisma

            response = client.get("/api/profile/")
            assert response.status_code == 404
            assert "not found" in response.json()["detail"].lower()

    def test_get_profile_success(self, client, mock_prisma):
        """Test GET /api/profile/ success"""
        from datetime import datetime

        mock_profile = MagicMock()
        mock_profile.id = "profile-123"
        mock_profile.userId = "test-user-123"
        mock_profile.height = 175
        mock_profile.weight = 70.5
        mock_profile.primaryStyle = "casual"
        mock_profile.secondaryStyle = "minimalist"
        mock_profile.occasions = json.dumps(["work", "casual"])
        mock_profile.createdAt = datetime.now()
        mock_profile.updatedAt = datetime.now()

        mock_prisma.profile.find_unique = AsyncMock(return_value=mock_profile)

        with patch("app.api.endpoints.profiles.get_prisma") as get_prisma_mock:
            get_prisma_mock.return_value = mock_prisma

            response = client.get("/api/profile/")
            assert response.status_code == 200
            data = response.json()
            assert data["id"] == "profile-123"
            assert data["height"] == 175
            assert data["weight"] == 70.5
            assert data["primaryStyle"] == "casual"
            assert data["secondaryStyle"] == "minimalist"
            assert isinstance(data["occasions"], list)

    def test_update_profile_create_new(self, client, mock_prisma):
        """Test PUT /api/profile/ creates new profile"""
        profile_data = {
            "height": 180,
            "weight": 75.0,
            "primary_style": "formal",
            "secondary_style": "preppy",
            "occasions": ["work", "events/formal"],
        }

        mock_prisma.profile.find_unique = AsyncMock(return_value=None)
        mock_prisma.user.find_unique = AsyncMock(return_value=MagicMock(id="test-user-123"))

        with patch("app.api.endpoints.profiles.get_prisma") as get_prisma_mock:
            get_prisma_mock.return_value = mock_prisma

            response = client.put("/api/profile/", json=profile_data)
            assert response.status_code == 200
            data = response.json()
            assert data["height"] == 180
            assert data["weight"] == 75.0

    def test_update_profile_existing(self, client, mock_prisma):
        """Test PUT /api/profile/ updates existing profile"""
        from datetime import datetime

        existing_profile = MagicMock()
        existing_profile.id = "profile-123"
        existing_profile.userId = "test-user-123"

        mock_prisma.profile.find_unique = AsyncMock(return_value=existing_profile)
        mock_prisma.user.find_unique = AsyncMock(return_value=MagicMock(id="test-user-123"))

        profile_data = {
            "height": 165,
            "weight": 60.0,
            "primary_style": "athletic",
            "occasions": ["athletic", "casual"],
        }

        with patch("app.api.endpoints.profiles.get_prisma") as get_prisma_mock:
            get_prisma_mock.return_value = mock_prisma

            response = client.put("/api/profile/", json=profile_data)
            assert response.status_code == 200
            data = response.json()
            assert data["height"] == 165
            assert data["weight"] == 60.0

    def test_update_profile_invalid_height(self, client):
        """Test PUT /api/profile/ with invalid height"""
        profile_data = {
            "height": 300,  # Invalid: > 250
            "weight": 70.0,
        }

        response = client.put("/api/profile/", json=profile_data)
        assert response.status_code == 422  # Validation error

    def test_update_profile_invalid_weight(self, client):
        """Test PUT /api/profile/ with invalid weight"""
        profile_data = {
            "height": 170,
            "weight": 20.0,  # Invalid: < 30
        }

        response = client.put("/api/profile/", json=profile_data)
        assert response.status_code == 422  # Validation error

    def test_update_profile_secondary_without_primary(self, client):
        """Test PUT /api/profile/ with secondary_style but no primary_style"""
        profile_data = {
            "secondary_style": "minimalist",  # Invalid: no primary_style
        }

        response = client.put("/api/profile/", json=profile_data)
        assert response.status_code == 422  # Validation error

    def test_update_profile_user_not_found(self, client, mock_prisma):
        """Test PUT /api/profile/ when user doesn't exist"""
        mock_prisma.user.find_unique = AsyncMock(return_value=None)

        profile_data = {
            "height": 170,
            "weight": 70.0,
        }

        with patch("app.api.endpoints.profiles.get_prisma") as get_prisma_mock:
            get_prisma_mock.return_value = mock_prisma

            response = client.put("/api/profile/", json=profile_data)
            assert response.status_code == 404
            assert "user not found" in response.json()["detail"].lower()

    def test_update_profile_empty_occasions(self, client, mock_prisma):
        """Test PUT /api/profile/ with empty occasions list"""
        mock_prisma.profile.find_unique = AsyncMock(return_value=None)
        mock_prisma.user.find_unique = AsyncMock(return_value=MagicMock(id="test-user-123"))

        profile_data = {
            "height": 175,
            "weight": 68.0,
            "primary_style": "casual",
            "occasions": [],
        }

        with patch("app.api.endpoints.profiles.get_prisma") as get_prisma_mock:
            get_prisma_mock.return_value = mock_prisma

            response = client.put("/api/profile/", json=profile_data)
            assert response.status_code == 200
            data = response.json()
            assert data["occasions"] == []

    def test_update_profile_partial_data(self, client, mock_prisma):
        """Test PUT /api/profile/ with partial data update"""
        from datetime import datetime

        existing_profile = MagicMock()
        existing_profile.id = "profile-123"
        existing_profile.userId = "test-user-123"

        mock_prisma.profile.find_unique = AsyncMock(return_value=existing_profile)
        mock_prisma.user.find_unique = AsyncMock(return_value=MagicMock(id="test-user-123"))

        # Only update height
        profile_data = {
            "height": 185,
        }

        with patch("app.api.endpoints.profiles.get_prisma") as get_prisma_mock:
            get_prisma_mock.return_value = mock_prisma

            response = client.put("/api/profile/", json=profile_data)
            assert response.status_code == 200
            data = response.json()
            assert data["height"] == 185


class TestProfileResponse:
    """Test ProfileResponse model conversion"""

    def test_from_db_with_all_fields(self):
        """Test ProfileResponse.from_db with all fields"""
        from datetime import datetime
        from app.api.endpoints.profiles import ProfileResponse

        mock_profile = MagicMock()
        mock_profile.id = "profile-123"
        mock_profile.userId = "user-123"
        mock_profile.height = 180
        mock_profile.weight = 75.5
        mock_profile.primaryStyle = "casual"
        mock_profile.secondaryStyle = "minimalist"
        mock_profile.occasions = json.dumps(["work", "casual"])
        mock_profile.createdAt = datetime.now()
        mock_profile.updatedAt = datetime.now()

        response = ProfileResponse.from_db(mock_profile)

        assert response.id == "profile-123"
        assert response.userId == "user-123"
        assert response.height == 180
        assert response.weight == 75.5
        assert response.primaryStyle == "casual"
        assert response.secondaryStyle == "minimalist"
        assert response.occasions == ["work", "casual"]

    def test_from_db_with_optional_fields_null(self):
        """Test ProfileResponse.from_db with null optional fields"""
        from datetime import datetime
        from app.api.endpoints.profiles import ProfileResponse

        mock_profile = MagicMock()
        mock_profile.id = "profile-123"
        mock_profile.userId = "user-123"
        mock_profile.height = None
        mock_profile.weight = None
        mock_profile.primaryStyle = None
        mock_profile.secondaryStyle = None
        mock_profile.occasions = None
        mock_profile.createdAt = datetime.now()
        mock_profile.updatedAt = datetime.now()

        response = ProfileResponse.from_db(mock_profile)

        assert response.height is None
        assert response.weight is None
        assert response.primaryStyle is None
        assert response.secondaryStyle is None
        assert response.occasions is None

    def test_from_db_with_invalid_occasions_json(self):
        """Test ProfileResponse.from_db with invalid occasions JSON"""
        from datetime import datetime
        from app.api.endpoints.profiles import ProfileResponse

        mock_profile = MagicMock()
        mock_profile.id = "profile-123"
        mock_profile.userId = "user-123"
        mock_profile.height = 170
        mock_profile.weight = 70.0
        mock_profile.primaryStyle = "casual"
        mock_profile.secondaryStyle = None
        mock_profile.occasions = "invalid-json"
        mock_profile.createdAt = datetime.now()
        mock_profile.updatedAt = datetime.now()

        response = ProfileResponse.from_db(mock_profile)

        # Should handle invalid JSON gracefully
        assert response.occasions is None or response.occasions == []
