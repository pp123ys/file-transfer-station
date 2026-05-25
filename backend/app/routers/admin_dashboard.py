from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.admin import DashboardResponse, DashboardStats
from app.schemas.audit_log import AuditLogResponse
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/api/admin/dashboard", tags=["管理员仪表盘"])

@router.get("", response_model=DashboardResponse)
async def get_dashboard(
    limit: int = Query(20, ge=1, le=100, description="返回最近日志的数量"),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """获取仪表盘统计数据和最近操作日志"""
    stats = AdminService.get_dashboard_stats(db)
    
    recent_logs = db.query(AuditLog)\
        .order_by(AuditLog.created_at.desc())\
        .limit(limit)\
        .all()
    
    return DashboardResponse(
        stats=DashboardStats(**stats),
        recent_logs=[AuditLogResponse.model_validate(log) for log in recent_logs]
    )
