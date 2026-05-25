from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.admin import Admin
from app.models.user import User
from app.models.file import File
from app.models.audit_log import AuditLog
from app.models.system_config import SystemConfig
from app.utils.admin_security import verify_password, create_admin_token


class AdminService:
    """管理员服务"""

    @staticmethod
    def authenticate_admin(db: Session, username: str, password: str) -> Optional[Admin]:
        """管理员认证"""
        admin = db.query(Admin).filter(Admin.username == username).first()
        if not admin:
            return None
        if not verify_password(password, admin.password_hash):
            return None
        if not admin.is_active:
            return None
        return admin

    @staticmethod
    def create_token(admin: Admin) -> str:
        """创建管理员token"""
        return create_admin_token({"sub": str(admin.id), "username": admin.username})

    @staticmethod
    def create_audit_log(
        db: Session,
        admin_id: int,
        action: str,
        target_type: Optional[str] = None,
        target_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """创建审计日志"""
        log = AuditLog(
            admin_id=admin_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log

    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        """获取仪表盘统计数据"""
        total_users = db.query(func.count(User.id)).scalar()
        total_files = db.query(func.count(File.id)).scalar()
        total_storage = db.query(func.sum(File.size)).scalar() or 0
        
        return {
            "total_users": total_users,
            "total_files": total_files,
            "total_storage": total_storage
        }

    @staticmethod
    def get_all_configs(db: Session) -> dict:
        """获取所有配置"""
        configs = db.query(SystemConfig).all()
        return {config.config_key: config.config_value for config in configs}

    @staticmethod
    def update_configs(db: Session, configs: dict) -> dict:
        """更新配置"""
        for key, value in configs.items():
            config = db.query(SystemConfig).filter(SystemConfig.config_key == key).first()
            if config:
                config.config_value = value
            else:
                config = SystemConfig(config_key=key, config_value=value)
                db.add(config)
        db.commit()
        return AdminService.get_all_configs(db)
