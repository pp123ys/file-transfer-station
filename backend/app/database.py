from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL, DATABASE_PASSWORD

# 构建完整的数据库URL
if DATABASE_PASSWORD:
    db_url = DATABASE_URL.replace("://root@", f"://root:{DATABASE_PASSWORD}@")
else:
    db_url = DATABASE_URL

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False  # 生产环境应关闭SQL日志
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """数据库会话依赖"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
