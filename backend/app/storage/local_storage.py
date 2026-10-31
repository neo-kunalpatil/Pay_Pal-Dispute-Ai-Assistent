import os
from app.core.config import settings
from app.storage.base import StorageAdapter

class LocalStorageAdapter(StorageAdapter):
    def __init__(self, base_dir: str = None):
        self.base_dir = base_dir or settings.UPLOAD_DIRECTORY
        os.makedirs(self.base_dir, exist_ok=True)

    async def save_file(self, file_content: bytes, filename: str) -> str:
        destination = os.path.join(self.base_dir, filename)
        with open(destination, 'wb') as f:
            f.write(file_content)
        return destination

    async def get_file(self, file_path: str) -> bytes:
        if not os.path.isabs(file_path):
            file_path = os.path.join(self.base_dir, file_path)
        with open(file_path, 'rb') as f:
            return f.read()

    async def delete_file(self, file_path: str) -> bool:
        if not os.path.isabs(file_path):
            file_path = os.path.join(self.base_dir, file_path)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

storage = LocalStorageAdapter()
