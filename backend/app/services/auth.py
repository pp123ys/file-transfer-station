from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.utils.security import verify_password, get_password_hash, create_access_token

class AuthService:
    """认证服务"""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """创建新用户"""
        # 检查用户名是否存在
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="用户名已存在"
            )
        
        # 检查邮箱是否存在
        if user_data.email:
            existing_email = db.query(User).filter(User.email == user_data.email).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="邮箱已被注册"
                )
        
        # 创建用户
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """验证用户登录"""
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        return user
    
    @staticmethod
    def create_token(user: User) -> str:
        """为用户创建访问令牌"""
        access_token = create_access_token(
            data={"sub": str(user.id), "username": user.username}
        )
        return access_token
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()
