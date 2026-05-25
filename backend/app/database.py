from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL, DATABASE_PASSWORD

# 解析URL并安全注入密码
db_url = make_url(DATABASE_URL)
if DATABASE_PASSWORD and not db_url.password:
    db_url = db_url.set(password=DATABASE_PASSWORD)

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
