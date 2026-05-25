from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.system_config import SystemConfig

router = APIRouter(prefix="/api/admin/settings", tags=["管理员配置管理"])

@router.get("")
async def get_settings(
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    configs = db.query(SystemConfig).all()
    return {
        "settings": [
            {
                "id": config.id,
                "config_key": config.config_key,
                "config_value": config.config_value,
                "updated_at": config.updated_at
            }
            for config in configs
        ]
    }

@router.put("")
async def update_settings(
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    data = await request.json()
    configs = data.get("settings", {})
    
    if not isinstance(configs, dict):
        raise HTTPException(status_code=400, detail="无效的请求格式")
    
    old_configs = AdminService.get_all_configs(db)
    updated_configs = AdminService.update_configs(db, configs)
    
    ip_address = request.client.host if request.client else None
    
    changes = []
    for key, new_value in configs.items():
        old_value = old_configs.get(key)
        if old_value != new_value:
            changes.append(f"{key}: {old_value or '未设置'} -> {new_value}")
    
    if changes:
        AdminService.create_audit_log(
            db=db,
            admin_id=current_admin.id,
            action="update_settings",
            target_type="system_config",
            details=f"更新配置: {', '.join(changes)}",
            ip_address=ip_address
        )
    
    return {"message": "配置已更新", "settings": updated_configs}
