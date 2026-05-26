from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.admin import AdminService
from app.services.config import ConfigService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.system_config import SystemConfig
from app.schemas.email import EmailConfigResponse
from app.services.email import EmailService

router = APIRouter(prefix="/api/admin/settings", tags=["管理员配置管理"])

@router.get("")
async def get_settings(
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    configs = db.query(SystemConfig).all()
    result = {}
    for config in configs:
        result[config.config_key] = config.config_value
    return {"configs": result}

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

@router.get("/email", response_model=EmailConfigResponse)
async def get_email_config(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return EmailConfigResponse(
        smtp_host=ConfigService.get_config(db, "smtp_host"),
        smtp_port=int(ConfigService.get_config(db, "smtp_port", "587")) if ConfigService.get_config(db, "smtp_port") else None,
        smtp_username=ConfigService.get_config(db, "smtp_username"),
        smtp_from_email=ConfigService.get_config(db, "smtp_from_email"),
        smtp_from_name=ConfigService.get_config(db, "smtp_from_name"),
        email_enabled=ConfigService.get_config(db, "email_enabled", "false") == "true"
    )

@router.put("/email")
async def update_email_config(
    config: EmailConfigResponse,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if config.smtp_host:
        ConfigService.set_config(db, "smtp_host", config.smtp_host)
    if config.smtp_port:
        ConfigService.set_config(db, "smtp_port", str(config.smtp_port))
    if config.smtp_username:
        ConfigService.set_config(db, "smtp_username", config.smtp_username)
    if config.smtp_from_email:
        ConfigService.set_config(db, "smtp_from_email", config.smtp_from_email)
    if config.smtp_from_name:
        ConfigService.set_config(db, "smtp_from_name", config.smtp_from_name)
    ConfigService.set_config(db, "email_enabled", str(config.email_enabled).lower())
    
    AdminService.create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="update_email_config",
        target_type="system_config",
        details="更新邮件配置",
        ip_address=request.client.host if request.client else None
    )
    
    return {"success": True, "message": "邮件配置已更新"}

@router.post("/test-email")
async def test_email(
    email: str,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    success = await EmailService.send_test_email(db, email)
    
    if success:
        return {"success": True, "message": f"测试邮件已发送至 {email}"}
    else:
        return {"success": False, "message": "邮件发送失败，请检查配置"}
