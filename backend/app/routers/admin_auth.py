from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.admin import AdminResponse, AdminAuthResponse
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin

router = APIRouter(prefix="/api/admin/auth", tags=["管理员认证"])

@router.post("/login", response_model=AdminAuthResponse)
async def admin_login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    admin = AdminService.authenticate_admin(db, form_data.username, form_data.password)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = AdminService.create_token(admin)
    
    ip_address = request.client.host if request.client else None
    AdminService.create_audit_log(
        db=db,
        admin_id=admin.id,
        action="login",
        ip_address=ip_address,
        details="管理员登录"
    )
    
    return AdminAuthResponse(
        access_token=token,
        token_type="bearer",
        admin=AdminResponse.model_validate(admin)
    )

@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(
    current_admin: Admin = Depends(get_current_admin)
):
    return AdminResponse.model_validate(current_admin)

@router.post("/logout")
async def admin_logout(
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ip_address = request.client.host if request.client else None
    AdminService.create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="logout",
        ip_address=ip_address,
        details="管理员登出"
    )
    
    return {"message": "登出成功"}
