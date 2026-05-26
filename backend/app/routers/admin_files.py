from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db, beijing_now
from app.schemas.file import FileResponse
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.user import User
from app.models.file import File
from app.utils.file import delete_physical_file
from datetime import datetime

router = APIRouter(prefix="/api/admin/files", tags=["管理员文件管理"])


@router.get("")
async def get_all_files(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: Optional[int] = Query(None, description="按用户ID筛选"),
    search: Optional[str] = Query(None, description="搜索文件名"),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """获取全局文件列表（分页、按用户筛选、搜索）"""
    query = db.query(File).join(User, File.user_id == User.id)
    
    if user_id:
        query = query.filter(File.user_id == user_id)
    
    if search:
        query = query.filter(File.name.contains(search))
    
    total = query.count()
    files = query.offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for file in files:
        result.append({
            "id": file.id,
            "name": file.name,
            "user_id": file.user_id,
            "username": file.owner.username if file.owner else None,
            "is_folder": file.is_folder,
            "size": file.size,
            "parent_id": file.parent_id,
            "is_deleted": file.is_deleted,
            "deleted_at": file.deleted_at,
            "created_at": file.created_at,
            "updated_at": file.updated_at
        })
    
    return {
        "files": result,
        "total": total,
        "page": page,
        "per_page": per_page
    }


@router.get("/{file_id}")
async def get_file_detail(
    file_id: int,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """获取文件详情"""
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    return {
        "file": FileResponse.model_validate(file),
        "username": file.owner.username if file.owner else None,
        "user_email": file.owner.email if file.owner else None
    }


@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    request: Request,
    permanent: bool = Query(False, description="是否永久删除"),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """删除任意用户文件"""
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    ip_address = request.client.host if request.client else None
    
    action = "permanent_delete_file" if permanent else "delete_file"
    details = f"永久删除" if permanent else "删除"
    
    if permanent:
        if file.is_folder:
            _delete_folder_recursive(db, file)
        else:
            if file.path:
                delete_physical_file(file.path, file.user_id)
        db.delete(file)
    else:
        file.is_deleted = True
        file.deleted_at = beijing_now()
        file.updated_at = beijing_now()
        db.flush()
        if file.is_folder:
            _soft_delete_folder_recursive(db, file)
    
    db.commit()
    
    AdminService.create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action=action,
        target_type="file",
        target_id=file.id,
        ip_address=ip_address,
        details=f"{details}文件 {file.name} (用户ID: {file.user_id})"
    )
    
    return {"message": "文件已删除"}


def _soft_delete_folder_recursive(db: Session, folder: File) -> None:
    """递归软删除文件夹及其内容"""
    children = db.query(File).filter(
        File.parent_id == folder.id,
        File.is_deleted == False
    ).all()
    
    for child in children:
        child.is_deleted = True
        child.deleted_at = beijing_now()
        child.updated_at = beijing_now()
        if child.is_folder:
            _soft_delete_folder_recursive(db, child)


def _delete_folder_recursive(db: Session, folder: File) -> None:
    """递归删除文件夹及其内容"""
    children = db.query(File).filter(
        File.parent_id == folder.id,
        File.is_deleted == False
    ).all()
    
    for child in children:
        if child.is_folder:
            _delete_folder_recursive(db, child)
        else:
            if child.path:
                delete_physical_file(child.path, folder.user_id)
            db.delete(child)
    
    db.delete(folder)
