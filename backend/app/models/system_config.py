from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database import Base, beijing_now


class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    config_key = Column(String(100), unique=True, index=True, nullable=False)
    config_value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=beijing_now, onupdate=beijing_now)

    def __repr__(self):
        return f"<SystemConfig {self.config_key}>"
