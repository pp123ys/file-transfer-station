from sqlalchemy.orm import Session
from app.models.system_config import SystemConfig
from app.config import STORAGE_QUOTA_BYTES, MAX_FILE_SIZE, ALLOWED_EXTENSIONS


class ConfigService:
    @staticmethod
    def get_config(db: Session, key: str, default=None):
        """获取单个配置值"""
        config = db.query(SystemConfig).filter(SystemConfig.config_key == key).first()
        if config:
            return config.config_value
        return default

    @staticmethod
    def get_storage_quota_bytes(db: Session) -> int:
        """获取存储配额（字节）"""
        value = ConfigService.get_config(db, 'storage_quota')
        if value and value.isdigit():
            return int(value) * 1024 * 1024 * 1024
        return STORAGE_QUOTA_BYTES

    @staticmethod
    def get_max_file_size(db: Session) -> int:
        """获取最大文件大小（字节）"""
        value = ConfigService.get_config(db, 'max_file_size')
        if value and value.isdigit():
            return int(value) * 1024 * 1024
        return MAX_FILE_SIZE

    @staticmethod
    def get_allowed_extensions(db: Session) -> list:
        """获取允许的文件扩展名列表"""
        value = ConfigService.get_config(db, 'allowed_extensions')
        if value and value != '*':
            return [ext.strip().lower() for ext in value.split(',') if ext.strip()]
        return ALLOWED_EXTENSIONS

    @staticmethod
    def is_registration_allowed(db: Session) -> bool:
        """检查是否允许用户注册"""
        value = ConfigService.get_config(db, 'allow_register')
        if value:
            return value.lower() == 'true'
        return True