from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class FileType(str, Enum):
    documents = "documents"
    images = "images"
    videos = "videos"
    downloads = "downloads"

class FileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    parent_id: Optional[int] = None

class FileCreate(FileBase):
    pass

class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    parent_id: Optional[int] = None

class FileResponse(FileBase):
    id: int
    user_id: int
    is_folder: bool
    size: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FileListResponse(BaseModel):
    files: List[FileResponse]
    total: int = 0

class FileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    parent_id: Optional[int] = None

class MessageResponse(BaseModel):
    message: str
