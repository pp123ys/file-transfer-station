from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SystemConfigResponse(BaseModel):
    id: int
    config_key: str
    config_value: str
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SystemConfigUpdate(BaseModel):
    config_value: str
