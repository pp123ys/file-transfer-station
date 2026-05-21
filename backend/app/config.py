from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql+pymysql://root:123456@localhost:3306/filemanager"
    )
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "./storage")
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # 不使用 BaseSettings 的环境变量解析，直接硬编码
    @property
    def ALLOWED_EXTENSIONS(self):
        return [
            '.txt', '.pdf', '.doc', '.docx', 
            '.jpg', '.jpeg', '.png', '.gif',
            '.mp4', '.mp3', '.zip', '.rar'
        ]
    
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        env_file_encoding = "utf-8"

settings = Settings()
