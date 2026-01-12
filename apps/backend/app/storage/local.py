import os
import aiofiles
from pathlib import Path
from typing import Optional
from app.storage.interface import StorageInterface
from app.core.config import settings


class LocalStorage(StorageInterface):
    """Local filesystem storage implementation"""

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir or settings.upload_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    async def upload(
        self, file_path: str, content: bytes, content_type: Optional[str] = None
    ) -> str:
        """Upload a file to local storage"""
        full_path = self.base_dir / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)

        async with aiofiles.open(full_path, "wb") as f:
            await f.write(content)

        return self.get_public_url(file_path)

    async def download(self, file_path: str) -> bytes:
        """Download a file from local storage"""
        full_path = self.base_dir / file_path

        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        async with aiofiles.open(full_path, "rb") as f:
            return await f.read()

    async def delete(self, file_path: str) -> None:
        """Delete a file from local storage"""
        full_path = self.base_dir / file_path

        if full_path.exists():
            full_path.unlink()

    async def exists(self, file_path: str) -> bool:
        """Check if a file exists in local storage"""
        full_path = self.base_dir / file_path
        return full_path.exists()

    def get_public_url(self, file_path: str) -> str:
        """Get the public URL for a local file"""
        # In production, this would return a proper URL
        # For now, return a relative path
        return f"/uploads/{file_path}"
