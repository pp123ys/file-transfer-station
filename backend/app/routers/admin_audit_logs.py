from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.audit_log import AuditLog
from datetime import datetime

router = APIRouter(prefix="/api/admin/audit-logs", tags=["管理员审计日志"])


@router.get("")
async def get_audit_logs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None),
    target_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    
    if action:
        query = query.filter(AuditLog.action == action)
    
    if target_type:
        query = query.filter(AuditLog.target_type == target_type)
    
    if start_date:
        query = query.filter(AuditLog.created_at >= start_date)
    
    if end_date:
        query = query.filter(AuditLog.created_at <= end_date)
    
    query = query.order_by(AuditLog.created_at.desc())
    
    total = query.count()
    logs = query.offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for log in logs:
        result.append({
            "id": log.id,
            "admin_id": log.admin_id,
            "admin_username": log.admin.username if log.admin else None,
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        })
    
    return {
        "logs": result,
        "total": total,
        "page": page,
        "per_page": per_page
    }
