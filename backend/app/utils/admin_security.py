from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.config import ADMIN_SECRET_KEY, ADMIN_ALGORITHM, ADMIN_ACCESS_TOKEN_EXPIRE_DAYS
from app.database import get_db, beijing_now
from app.models.admin import Admin

admin_security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated_password = plain_password[:72].encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(truncated_password, hashed_bytes)

def get_password_hash(password: str) -> str:
    truncated_password = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(truncated_password, salt)
    return hashed.decode('utf-8')

def create_admin_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = beijing_now() + expires_delta
    else:
        expire = beijing_now() + timedelta(days=ADMIN_ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, ADMIN_SECRET_KEY, algorithm=ADMIN_ALGORITHM)
    return encoded_jwt

def decode_admin_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=[ADMIN_ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(admin_security),
    db: Session = Depends(get_db)
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="请先登录",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decode_admin_token(token)
    
    if payload is None:
        raise credentials_exception
    
    admin_id_str = payload.get("sub")
    if admin_id_str is None:
        raise credentials_exception
    
    try:
        admin_id = int(admin_id_str)
    except ValueError:
        raise credentials_exception
    
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if admin is None:
        raise credentials_exception
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理员已被禁用"
        )
    
    return admin
