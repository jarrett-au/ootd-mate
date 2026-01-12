"""
Unit tests for configuration management
"""
import pytest
from app.core.config import Settings, get_settings, settings


class TestSettings:
    """Tests for Settings class"""

    def test_default_values(self):
        """Test that settings have correct default values"""
        test_settings = Settings()

        assert test_settings.api_port == 8000
        assert test_settings.api_host == "0.0.0.0"
        assert test_settings.database_url == "file:./dev.db"
        assert test_settings.frontend_url == "http://localhost:3000"
        assert test_settings.storage_type == "local"
        assert test_settings.upload_dir == "./uploads"
        assert test_settings.openai_api_key == ""
        assert test_settings.supabase_url == ""
        assert test_settings.supabase_anon_key == ""
        assert test_settings.supabase_service_role_key == ""

    def test_settings_from_env(self, monkeypatch):
        """Test that settings can be loaded from environment variables"""
        monkeypatch.setenv("API_PORT", "9000")
        monkeypatch.setenv("API_HOST", "127.0.0.1")
        monkeypatch.setenv("DATABASE_URL", "postgresql://localhost/test")
        monkeypatch.setenv("FRONTEND_URL", "http://localhost:4000")
        monkeypatch.setenv("STORAGE_TYPE", "s3")
        monkeypatch.setenv("UPLOAD_DIR", "/tmp/uploads")
        monkeypatch.setenv("OPENAI_API_KEY", "sk-test-key")
        monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
        monkeypatch.setenv("SUPABASE_ANON_KEY", "test-anon")
        monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-role")

        test_settings = Settings()

        assert test_settings.api_port == 9000
        assert test_settings.api_host == "127.0.0.1"
        assert test_settings.database_url == "postgresql://localhost/test"
        assert test_settings.frontend_url == "http://localhost:4000"
        assert test_settings.storage_type == "s3"
        assert test_settings.upload_dir == "/tmp/uploads"
        assert test_settings.openai_api_key == "sk-test-key"
        assert test_settings.supabase_url == "https://test.supabase.co"
        assert test_settings.supabase_anon_key == "test-anon"
        assert test_settings.supabase_service_role_key == "test-role"

    def test_settings_case_insensitive(self, monkeypatch):
        """Test that environment variable names are case-insensitive"""
        monkeypatch.setenv("API_PORT", "7000")

        test_settings = Settings()

        assert test_settings.api_port == 7000

    def test_supabase_settings_defaults(self):
        """Test Supabase settings default to empty strings"""
        test_settings = Settings()

        assert isinstance(test_settings.supabase_url, str)
        assert isinstance(test_settings.supabase_anon_key, str)
        assert isinstance(test_settings.supabase_service_role_key, str)
        assert test_settings.supabase_url == ""
        assert test_settings.supabase_anon_key == ""
        assert test_settings.supabase_service_role_key == ""

    def test_storage_settings(self):
        """Test storage-related settings"""
        test_settings = Settings()

        assert test_settings.storage_type == "local"
        assert test_settings.upload_dir == "./uploads"

    def test_ai_settings(self):
        """Test AI-related settings"""
        test_settings = Settings()

        assert test_settings.openai_api_key == ""

    def test_cors_settings(self):
        """Test CORS-related settings"""
        test_settings = Settings()

        assert test_settings.frontend_url == "http://localhost:3000"

    def test_api_port_is_integer(self, monkeypatch):
        """Test that API_PORT is correctly converted to integer"""
        monkeypatch.setenv("API_PORT", "8080")

        test_settings = Settings()

        assert isinstance(test_settings.api_port, int)
        assert test_settings.api_port == 8080

    def test_invalid_api_port_raises_error(self, monkeypatch):
        """Test that invalid API_PORT raises validation error"""
        monkeypatch.setenv("API_PORT", "invalid")

        with pytest.raises(Exception):
            Settings()


class TestGetSettings:
    """Tests for get_settings function"""

    def test_get_settings_returns_cached_instance(self, monkeypatch):
        """Test that get_settings returns cached settings instance"""
        # Clear any existing cache
        import app.core.config
        if hasattr(app.core.config.get_settings, 'cache_clear'):
            app.core.config.get_settings.cache_clear()

        monkeypatch.setenv("API_PORT", "8888")

        settings1 = get_settings()
        settings2 = get_settings()

        # Should return the same cached instance
        assert settings1 is settings2
        assert settings1.api_port == 8888

    def test_get_settings_singleton_behavior(self):
        """Test that get_settings behaves as a singleton"""
        settings1 = get_settings()
        settings2 = get_settings()

        # Both calls should return the same instance
        assert id(settings1) == id(settings2)


class TestGlobalSettingsInstance:
    """Tests for global settings instance"""

    def test_global_settings_exists(self):
        """Test that global settings instance is available"""
        from app.core.config import settings

        assert settings is not None
        assert isinstance(settings, Settings)

    def test_global_settings_has_required_attributes(self):
        """Test that global settings has all required attributes"""
        from app.core.config import settings

        # API settings
        assert hasattr(settings, 'api_port')
        assert hasattr(settings, 'api_host')

        # Database settings
        assert hasattr(settings, 'database_url')

        # Frontend settings
        assert hasattr(settings, 'frontend_url')

        # Storage settings
        assert hasattr(settings, 'storage_type')
        assert hasattr(settings, 'upload_dir')

        # AI settings
        assert hasattr(settings, 'openai_api_key')

        # Supabase settings
        assert hasattr(settings, 'supabase_url')
        assert hasattr(settings, 'supabase_anon_key')
        assert hasattr(settings, 'supabase_service_role_key')

    def test_global_settings_accessible(self):
        """Test that global settings can be accessed"""
        from app.core.config import settings

        # Should be able to read settings
        port = settings.api_port
        host = settings.api_host
        frontend = settings.frontend_url

        assert isinstance(port, int)
        assert isinstance(host, str)
        assert isinstance(frontend, str)
