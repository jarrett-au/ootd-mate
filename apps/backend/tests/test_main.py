"""
Unit tests for main application endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


class TestRootEndpoint:
    """Tests for GET /"""

    def test_root_endpoint(self, client):
        """Test root endpoint returns welcome message"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "OOTD Mate API"

    def test_root_endpoint_content_type(self, client):
        """Test root endpoint returns JSON content type"""
        response = client.get("/")

        assert response.status_code == 200
        assert "application/json" in response.headers["content-type"]


class TestHealthEndpoint:
    """Tests for GET /health"""

    def test_health_check(self, client):
        """Test health check endpoint returns healthy status"""
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"

    def test_health_check_response_time(self, client):
        """Test that health check responds quickly"""
        import time

        start_time = time.time()
        response = client.get("/health")
        end_time = time.time()

        assert response.status_code == 200
        # Should respond in less than 100ms
        assert (end_time - start_time) < 0.1


class TestAPIRouter:
    """Tests for API router configuration"""

    def test_api_auth_endpoints_registered(self, client):
        """Test that auth endpoints are registered under /api prefix"""
        # Test login endpoint exists
        response = client.post("/api/auth/login", json={"provider": "google"})
        # Should not return 404
        assert response.status_code != 404

    def test_api_auth_me_endpoint_requires_auth(self, client):
        """Test that /api/auth/me requires authentication"""
        response = client.get("/api/auth/me")

        # Should return 401 without auth
        assert response.status_code == 401

    def test_api_auth_session_endpoint(self, client):
        """Test that /api/auth/session endpoint exists"""
        response = client.get("/api/auth/session")

        # Should return 200 (no auth required)
        assert response.status_code == 200
        data = response.json()
        assert "authenticated" in data

    def test_api_auth_logout_endpoint(self, client):
        """Test that /api/auth/logout endpoint exists"""
        response = client.post("/api/auth/logout")

        # Should return 200 (logout succeeds even without session)
        assert response.status_code == 200


class TestCORSConfiguration:
    """Tests for CORS middleware configuration"""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are present in responses"""
        response = client.get("/")

        # Check for CORS headers
        assert "access-control-allow-origin" in response.headers


class TestAPIv1Prefix:
    """Tests for API versioning and routing"""

    def test_all_auth_endpoints_under_api_prefix(self, client):
        """Test that all auth endpoints are under /api prefix"""
        endpoints = [
            "/api/auth/login",
            "/api/auth/callback",
            "/api/auth/logout",
            "/api/auth/me",
            "/api/auth/session",
        ]

        for endpoint in endpoints:
            # Create appropriate request
            if "login" in endpoint:
                response = client.post(endpoint, json={"provider": "google"})
            elif "logout" in endpoint:
                response = client.post(endpoint)
            else:
                response = client.get(endpoint)

            # Should not return 404 (endpoint exists)
            # May return 401 or other errors, but not 404
            assert response.status_code != 404, f"Endpoint {endpoint} not found"

    def test_endpoints_without_api_prefix_404(self, client):
        """Test that endpoints without /api prefix return 404"""
        # These should NOT exist without /api prefix
        response = client.get("/auth/login")

        assert response.status_code == 404
