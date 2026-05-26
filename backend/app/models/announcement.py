from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    display_type = Column(String(20), default="banner")
    is_pinned = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Announcement {self.title}>"


class AnnouncementDismissal(Base):
    __tablename__ = "announcement_dismissals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    announcement_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    dismissed_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<AnnouncementDismissal a={self.announcement_id} u={self.user_id}>"
