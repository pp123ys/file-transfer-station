from sqlalchemy import Column, Integer, String, Boolean, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base, beijing_now

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    path = Column(String(1000), nullable=False)
    is_folder = Column(Boolean, default=False)
    size = Column(BigInteger, default=0)
    parent_id = Column(Integer, ForeignKey("files.id"), nullable=True, index=True)
    is_deleted = Column(Boolean, default=False, index=True)
    deleted_at = Column(DateTime, nullable=True)
    thumbnail_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=beijing_now)
    updated_at = Column(DateTime, default=beijing_now, onupdate=beijing_now)
    
    owner = relationship("User", back_populates="files")
    parent = relationship("File", remote_side=[id], backref="children")
    
    def __repr__(self):
        return f"<File {self.name}>"
