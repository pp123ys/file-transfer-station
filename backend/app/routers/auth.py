from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, AuthResponse
from app.services.auth import AuthService
from app.services.config import ConfigService
from app.utils.security import get_current_user
from app.utils.rate_limit import get_limiter
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["认证"])
limiter = get_limiter()

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    """用户注册"""
    if not ConfigService.is_registration_allowed(db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="当前系统已关闭用户注册"
        )
    
    user = AuthService.create_user(db, user_data)
    token = AuthService.create_token(user)
    
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=AuthResponse)
@limiter.limit("10/minute")
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """用户登录"""
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = AuthService.create_token(user)
    
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """获取当前用户信息"""
    return UserResponse.model_validate(current_user)

@router.post("/logout")
async def logout():
    """用户登出（前端清除token即可）"""
    return {"message": "登出成功"}


@router.put("/change-password")
@limiter.limit("5/minute")
async def change_password(
    request: Request,
    data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.schemas.user import ChangePasswordRequest
    from app.utils.security import verify_password, get_password_hash

    req = ChangePasswordRequest(**data)

    if not verify_password(req.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="旧密码错误"
        )

    current_user.password_hash = get_password_hash(req.new_password)
    db.commit()

    return {"message": "密码修改成功"}
