import os

# 数据库配置 - MySQL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:123456@localhost:3306/filemanager"
)

# JWT配置
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# 文件存储配置
STORAGE_PATH = os.getenv("STORAGE_PATH", "./storage")
MAX_FILE_SIZE = 100 * 1024 * 1024
ALLOWED_EXTENSIONS = [
    ".txt", ".pdf", ".doc", ".docx",
    ".jpg", ".jpeg", ".png", ".gif",
    ".mp4", ".mp3", ".zip", ".rar"
]

# 调试模式
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
