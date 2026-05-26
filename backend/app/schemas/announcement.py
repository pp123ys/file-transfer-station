from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AnnouncementCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    display_type: str = Field("banner")
    is_pinned: bool = False
    is_active: bool = True


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    display_type: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_active: Optional[bool] = None


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    display_type: str
    is_pinned: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
