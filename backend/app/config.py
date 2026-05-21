from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:123456@localhost:3306/filemanager"
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    STORAGE_PATH: str = "./storage"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024
    ALLOWED_EXTENSIONS: List[str] = [
        '.txt', '.pdf', '.doc', '.docx', 
        '.jpg', '.jpeg', '.png', '.gif',
        '.mp4', '.mp3', '.zip', '.rar'
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()
