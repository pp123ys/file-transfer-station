from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
