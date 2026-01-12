from app.storage.interface import StorageInterface
from app.storage.local import LocalStorage


def get_storage() -> StorageInterface:
    """Factory function to get the appropriate storage implementation"""
    from app.core.config import settings

    if settings.storage_type == "local":
        return LocalStorage()
    else:
        raise ValueError(f"Unsupported storage type: {settings.storage_type}")


__all__ = ["StorageInterface", "LocalStorage", "get_storage"]
