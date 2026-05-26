from datetime import datetime, timedelta, timezone

def beijing_now():
    """返回北京时间（UTC+8）的 naive datetime，兼容 SQLAlchemy"""
    return (datetime.now(timezone.utc) + timedelta(hours=8)).replace(tzinfo=None)