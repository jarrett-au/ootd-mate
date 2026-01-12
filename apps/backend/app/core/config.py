from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings"""

    # API
    api_port: int = 8000
    api_host: str = "0.0.0.0"

    # Database
    database_url: str = "file:./dev.db"

    # Frontend
    frontend_url: str = "http://localhost:3000"

    # Storage
    storage_type: str = "local"
    upload_dir: str = "./uploads"

    # AI
    openai_api_key: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
