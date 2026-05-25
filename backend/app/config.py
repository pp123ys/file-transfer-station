import os

# 数据库配置 - MySQL（强烈建议使用环境变量）
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root@localhost:3306/filemanager"
)
# 如果需要密码，请设置环境变量 DATABASE_PASSWORD
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "")

# JWT配置
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable must be set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# 管理员JWT配置
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")
if not ADMIN_SECRET_KEY:
    raise ValueError("ADMIN_SECRET_KEY environment variable must be set")
ADMIN_ALGORITHM = "HS256"
ADMIN_ACCESS_TOKEN_EXPIRE_DAYS = 1

# 文件存储配置
STORAGE_PATH = os.getenv("STORAGE_PATH", "./storage")
MAX_FILE_SIZE = 100 * 1024 * 1024
ALLOWED_EXTENSIONS = [
    ".txt", ".pdf", ".doc", ".docx",
    ".jpg", ".jpeg", ".png", ".gif",
    ".mp4", ".mp3", ".zip", ".rar"
]

# 调试模式
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# 存储配额配置
STORAGE_QUOTA_GB = int(os.getenv("STORAGE_QUOTA_GB", "2"))
STORAGE_QUOTA_BYTES = STORAGE_QUOTA_GB * 1024 * 1024 * 1024