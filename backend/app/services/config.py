from sqlalchemy.orm import Session
from app.models.system_config import SystemConfig
from app.config import STORAGE_QUOTA_BYTES, MAX_FILE_SIZE, ALLOWED_EXTENSIONS


class ConfigService:
    @staticmethod
    def get_config(db: Session, key: str, default=None):
        config = db.query(SystemConfig).filter(SystemConfig.config_key == key).first()
        if config:
            return config.config_value
        return default

    @staticmethod
    def get_storage_quota_bytes(db: Session) -> int:
        value = ConfigService.get_config(db, 'storage_quota')
        if value and value.isdigit():
            return int(value) * 1024 * 1024 * 1024
        return STORAGE_QUOTA_BYTES

    @staticmethod
    def get_max_file_size(db: Session) -> int:
        value = ConfigService.get_config(db, 'max_file_size')
        if value and value.isdigit():
            return int(value) * 1024 * 1024
        return MAX_FILE_SIZE

    @staticmethod
    def get_allowed_extensions(db: Session) -> list:
        value = ConfigService.get_config(db, 'allowed_extensions')
        if value and value != '*':
            return [ext.strip().lower() for ext in value.split(',') if ext.strip()]
        return ALLOWED_EXTENSIONS

    @staticmethod
    def is_registration_allowed(db: Session) -> bool:
        value = ConfigService.get_config(db, 'allow_register')
        if value:
            return value.lower() == 'true'
        return True

    @staticmethod
    def is_email_required(db: Session) -> bool:
        value = ConfigService.get_config(db, 'require_email')
        if value:
            return value.lower() == 'true'
        return True

    @staticmethod
    def set_config(db: Session, key: str, value: str):
        config = db.query(SystemConfig).filter(SystemConfig.config_key == key).first()
        if config:
            config.config_value = value
        else:
            config = SystemConfig(config_key=key, config_value=value)
            db.add(config)
        db.commit()