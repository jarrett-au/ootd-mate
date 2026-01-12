from abc import ABC, abstractmethod
from typing import Optional
import io


class StorageInterface(ABC):
    """Abstract storage interface"""

    @abstractmethod
    async def upload(self, file_path: str, content: bytes, content_type: Optional[str] = None) -> str:
        """
        Upload a file and return its public URL

        Args:
            file_path: Path where the file should be stored
            content: File content as bytes
            content_type: MIME type of the file

        Returns:
            Public URL of the uploaded file
        """
        pass

    @abstractmethod
    async def download(self, file_path: str) -> bytes:
        """
        Download a file

        Args:
            file_path: Path of the file to download

        Returns:
            File content as bytes
        """
        pass

    @abstractmethod
    async def delete(self, file_path: str) -> None:
        """
        Delete a file

        Args:
            file_path: Path of the file to delete
        """
        pass

    @abstractmethod
    async def exists(self, file_path: str) -> bool:
        """
        Check if a file exists

        Args:
            file_path: Path to check

        Returns:
            True if file exists, False otherwise
        """
        pass

    @abstractmethod
    def get_public_url(self, file_path: str) -> str:
        """
        Get the public URL for a file

        Args:
            file_path: Path of the file

        Returns:
            Public URL of the file
        """
        pass
