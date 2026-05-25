from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.user import UserResponse
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.user import User
from app.models.file import File
from sqlalchemy import func

router = APIRouter(prefix="/api/admin/users", tags=["管理员用户管理"])

@router.get("")
async def get_users(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.username.contains(search)) | (User.email.contains(search))
        )
    
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for user in users:
        file_count = db.query(func.count(File.id)).filter(File.user_id == user.id).scalar()
        storage_used = db.query(func.sum(File.size)).filter(File.user_id == user.id).scalar() or 0
        
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
            "file_count": file_count,
            "storage_used": storage_used
        })
    
    return {
        "users": result,
        "total": total,
        "page": page,
        "per_page": per_page
    }

@router.get("/{user_id}")
async def get_user_detail(
    user_id: int,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    file_count = db.query(func.count(File.id)).filter(File.user_id == user.id).scalar()
    storage_used = db.query(func.sum(File.size)).filter(File.user_id == user.id).scalar() or 0
    
    files = db.query(File).filter(File.user_id == user_id).all()
    
    return {
        "user": UserResponse.model_validate(user),
        "file_count": file_count,
        "storage_used": storage_used,
        "files": [
            {
                "id": f.id,
                "name": f.name,
                "size": f.size,
                "is_folder": f.is_folder,
                "created_at": f.created_at
            }
            for f in files
        ]
    }

@router.patch("/{user_id}")
async def update_user(
    user_id: int,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    data = await request.json()
    action = data.get("action")
    
    ip_address = request.client.host if request.client else None
    
    if action == "toggle_active":
        user.is_active = not user.is_active
        db.commit()
        
        AdminService.create_audit_log(
            db=db,
            admin_id=current_admin.id,
            action="toggle_user",
            target_type="user",
            target_id=user.id,
            ip_address=ip_address,
            details=f"{'启用' if user.is_active else '禁用'}用户 {user.username}"
        )
        
        return {"message": f"用户已{'启用' if user.is_active else '禁用'}", "is_active": user.is_active}
    
    raise HTTPException(status_code=400, detail="无效的操作")

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    ip_address = request.client.host if request.client else None
    
    AdminService.create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="delete_user",
        target_type="user",
        target_id=user.id,
        ip_address=ip_address,
        details=f"删除用户 {user.username}"
    )
    
    db.delete(user)
    db.commit()
    
    return {"message": "用户已删除"}
