"""
Unit tests for authentication endpoints
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.core.config import settings


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def mock_supabase_response():
    """Mock Supabase response"""
    return {
        "id": "user-123",
        "email": "test@example.com",
        "user_metadata": {
            "full_name": "Test User",
            "avatar_url": "https://example.com/avatar.jpg"
        },
        "created_at": "2024-01-01T00:00:00Z"
    }


@pytest.fixture
def mock_session_data():
    """Mock session data from Supabase"""
    return {
        "access_token": "test-access-token",
        "refresh_token": "test-refresh-token",
        "expires_at": 1234567890,
        "user": {
            "id": "user-123",
            "email": "test@example.com",
            "user_metadata": {
                "full_name": "Test User",
                "avatar_url": "https://example.com/avatar.jpg"
            },
            "created_at": "2024-01-01T00:00:00Z"
        }
    }


class TestLoginEndpoint:
    """Tests for POST /api/auth/login"""

    def test_login_with_google_provider(self, client):
        """Test successful login initiation with Google provider"""
        response = client.post(
            "/api/auth/login",
            json={"provider": "google", "redirect_to": "/dashboard"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "url" in data
        assert "google" in data["url"]
        assert "authorize" in data["url"]

        # Check that cookies are set
        cookies = response.cookies
        assert "sb-code-verifier" in cookies
        assert "sb-redirect-to" in cookies
        # Cookie value may be quoted, so extract the actual value
        redirect_to = cookies.get("sb-redirect-to", "")
        assert redirect_to.replace('"', '') == "/dashboard"

    def test_login_with_default_redirect(self, client):
        """Test login with default redirect parameter"""
        response = client.post(
            "/api/auth/login",
            json={"provider": "google"}
        )

        assert response.status_code == 200
        cookies = response.cookies
        redirect_to = cookies.get("sb-redirect-to", "")
        assert redirect_to.replace('"', '') == "/"

    def test_login_with_unsupported_provider(self, client):
        """Test that unsupported providers return 400 error"""
        response = client.post(
            "/api/auth/login",
            json={"provider": "facebook", "redirect_to": "/"}
        )

        assert response.status_code == 400
        assert "Only Google OAuth" in response.json()["detail"]


class TestCallbackEndpoint:
    """Tests for GET /api/auth/callback"""

    @patch('httpx.AsyncClient')
    def test_callback_successful_oauth(self, mock_client, client, mock_session_data):
        """Test successful OAuth callback"""
        # Mock the httpx response
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_session_data

        mock_httpx_client = AsyncMock()
        mock_httpx_client.post.return_value = mock_response
        mock_httpx_client.__aenter__.return_value = mock_httpx_client
        mock_httpx_client.__aexit__.return_value = None

        mock_client.return_value = mock_httpx_client

        # Create a request with cookies
        client.cookies.set("sb-code-verifier", "test-verifier")
        client.cookies.set("sb-redirect-to", "/dashboard")

        response = client.get(
            "/api/auth/callback",
            params={"code": "test-auth-code", "state": "test-state"}
        )

        # Should redirect to frontend
        assert response.status_code == 302
        assert "/dashboard" in response.headers.get("location", "")

    @patch('httpx.AsyncClient')
    def test_callback_with_error(self, mock_client, client):
        """Test callback with OAuth error"""
        client.cookies.set("sb-code-verifier", "test-verifier")

        response = client.get(
            "/api/auth/callback",
            params={"error": "access_denied", "error_description": "User denied access"}
        )

        assert response.status_code == 400
        assert "OAuth error" in response.json()["detail"]

    def test_callback_missing_code_verifier(self, client):
        """Test callback without code verifier cookie"""
        response = client.get(
            "/api/auth/callback",
            params={"code": "test-code"}
        )

        assert response.status_code == 400
        assert "Missing code verifier" in response.json()["detail"]

    @patch('httpx.AsyncClient')
    def test_callback_token_exchange_fails(self, mock_client, client):
        """Test callback when token exchange fails"""
        # Mock failed response
        mock_response = AsyncMock()
        mock_response.status_code = 401

        mock_httpx_client = AsyncMock()
        mock_httpx_client.post.return_value = mock_response
        mock_httpx_client.__aenter__.return_value = mock_httpx_client
        mock_httpx_client.__aexit__.return_value = None

        mock_client.return_value = mock_httpx_client

        client.cookies.set("sb-code-verifier", "test-verifier")

        response = client.get(
            "/api/auth/callback",
            params={"code": "test-code"}
        )

        assert response.status_code == 401


class TestLogoutEndpoint:
    """Tests for POST /api/auth/logout"""

    @patch('httpx.AsyncClient')
    def test_logout_successful(self, mock_client, client):
        """Test successful logout"""
        # Mock Supabase logout response
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {}

        mock_httpx_client = AsyncMock()
        mock_httpx_client.post.return_value = mock_response
        mock_httpx_client.__aenter__.return_value = mock_httpx_client
        mock_httpx_client.__aexit__.return_value = None

        mock_client.return_value = mock_httpx_client

        # Set auth cookies
        client.cookies.set("sb-refresh-token", "test-refresh-token")

        response = client.post("/api/auth/logout")

        assert response.status_code == 200
        assert response.json()["message"] == "Logged out successfully"

    @patch('httpx.AsyncClient')
    def test_logout_without_refresh_token(self, mock_client, client):
        """Test logout when no refresh token exists"""
        response = client.post("/api/auth/logout")

        assert response.status_code == 200
        assert response.json()["message"] == "Logged out successfully"

    @patch('httpx.AsyncClient')
    def test_logout_clears_cookies(self, mock_client, client):
        """Test that logout clears all auth cookies"""
        mock_response = AsyncMock()
        mock_response.status_code = 200

        mock_httpx_client = AsyncMock()
        mock_httpx_client.post.return_value = mock_response
        mock_httpx_client.__aenter__.return_value = mock_httpx_client
        mock_httpx_client.__aexit__.return_value = None

        mock_client.return_value = mock_httpx_client

        client.cookies.set("sb-access-token", "test-access")
        client.cookies.set("sb-refresh-token", "test-refresh")

        response = client.post("/api/auth/logout")

        # Check that cookies are cleared (expired)
        cookies = response.headers.get('set-cookie', '')
        assert 'sb-access-token=' in cookies
        assert 'sb-refresh-token=' in cookies


class TestGetMeEndpoint:
    """Tests for GET /api/auth/me"""

    @patch('app.api.deps.get_current_user')
    def test_get_me_authenticated(self, mock_get_user, client, mock_supabase_response):
        """Test getting current user when authenticated"""
        mock_get_user.return_value = mock_supabase_response

        response = client.get("/api/auth/me")

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user"]["id"] == "user-123"
        assert data["user"]["email"] == "test@example.com"

    @patch('app.api.deps.get_current_user')
    def test_get_me_unauthenticated(self, mock_get_user, client):
        """Test getting current user when not authenticated"""
        from fastapi import HTTPException
        mock_get_user.side_effect = HTTPException(status_code=401, detail="Not authenticated")

        response = client.get("/api/auth/me")

        assert response.status_code == 401


class TestGetSessionEndpoint:
    """Tests for GET /api/auth/session"""

    def test_get_session_no_token(self, client):
        """Test session check without access token"""
        response = client.get("/api/auth/session")

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is False
        assert data["user"] is None

    @patch('httpx.AsyncClient')
    def test_get_session_valid_token(self, mock_client, client, mock_supabase_response):
        """Test session check with valid access token"""
        # Mock Supabase user endpoint response
        mock_response = AsyncMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_supabase_response

        mock_httpx_client = AsyncMock()
        mock_httpx_client.get.return_value = mock_response
        mock_httpx_client.__aenter__.return_value = mock_httpx_client
        mock_httpx_client.__aexit__.return_value = None

        mock_client.return_value = mock_httpx_client

        client.cookies.set("sb-access-token", "valid-token")

        response = client.get("/api/auth/session")

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["user"]["id"] == "user-123"

    @patch('httpx.AsyncClient')
    def test_get_session_invalid_token(self, mock_client, client):
        """Test session check with invalid access token"""
        # Mock Supabase returning 401
        mock_response = AsyncMock()
        mock_response.status_code = 401

        mock_httpx_client = AsyncMock()
        mock_httpx_client.get.return_value = mock_response
        mock_httpx_client.__aenter__.return_value = mock_httpx_client
        mock_httpx_client.__aexit__.return_value = None

        mock_client.return_value = mock_httpx_client

        client.cookies.set("sb-access-token", "invalid-token")

        response = client.get("/api/auth/session")

        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is False
        assert data["user"] is None

    @patch('httpx.AsyncClient')
    def test_get_session_timeout(self, mock_client, client):
        """Test session check when Supabase times out"""
        import httpx

        mock_httpx_client = AsyncMock()
        mock_httpx_client.get.side_effect = httpx.TimeoutException("Request timed out")
        mock_httpx_client.__aenter__.return_value = mock_httpx_client
        mock_httpx_client.__aexit__.return_value = None

        mock_client.return_value = mock_httpx_client

        client.cookies.set("sb-access-token", "test-token")

        response = client.get("/api/auth/session")

        # Should return unauthenticated on timeout
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is False
