import os
from PIL import Image
from pathlib import Path

class ThumbnailService:
    def __init__(self, max_width: int = 200, max_height: int = 200):
        self.max_width = max_width
        self.max_height = max_height

    def generate_thumbnail(self, source_path: str, thumbnail_path: str) -> bool:
        try:
            with Image.open(source_path) as img:
                img.thumbnail((self.max_width, self.max_height), Image.Resampling.LANCZOS)
                os.makedirs(os.path.dirname(thumbnail_path), exist_ok=True)
                img.save(thumbnail_path)
            return True
        except Exception as e:
            print(f"Failed to generate thumbnail: {e}")
            return False

    def get_thumbnail_path(self, user_id: int, file_id: int, extension: str) -> str:
        return f"thumbnails/{user_id}/{file_id}_thumb{extension}"

    def get_full_thumbnail_path(self, user_id: int, file_id: int, extension: str) -> Path:
        base_path = Path("storage") / "thumbnails" / str(user_id)
        return base_path / f"{file_id}_thumb{extension}"


thumbnail_service = ThumbnailService()
