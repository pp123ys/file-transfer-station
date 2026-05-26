from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta, timezone
from app.config import DATABASE_URL, DATABASE_PASSWORD

def beijing_now():
    """Return Beijing time (UTC+8) naive datetime for SQLAlchemy compatibility"""
    return (datetime.now(timezone.utc) + timedelta(hours=8)).replace(tzinfo=None)

# Parse URL and securely inject password
db_url = make_url(DATABASE_URL)
if DATABASE_PASSWORD and not db_url.password:
    db_url = db_url.set(password=DATABASE_PASSWORD)

engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()