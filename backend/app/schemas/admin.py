from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.audit_log import AuditLogResponse

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse

class DashboardStats(BaseModel):
    total_users: int
    total_files: int
    total_storage: int

class DashboardResponse(BaseModel):
    stats: DashboardStats
    recent_logs: List[AuditLogResponse]
