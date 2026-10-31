from abc import ABC, abstractmethod
from typing import BinaryIO

class StorageAdapter(ABC):
    @abstractmethod
    async def save_file(self, file_content: bytes, destination_path: str) -> str:
        pass

    @abstractmethod
    async def get_file(self, file_path: str) -> bytes:
        pass

    @abstractmethod
    async def delete_file(self, file_path: str) -> bool:
        pass
