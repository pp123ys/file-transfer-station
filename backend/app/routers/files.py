from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.schemas.file import (
    FileResponse as FileSchema, FileListResponse, FolderCreate,
    FileUpdate, MessageResponse, FileType, StorageInfo
)
from app.services.file import FileService
from app.utils.security import get_current_user, get_optional_user, get_user_from_token
from app.utils.file import get_file_path, get_file_extension, is_image_file
from app.services.thumbnail import thumbnail_service
import mimetypes

router = APIRouter(prefix="/api/files", tags=["文件"])

@router.get("", response_model=FileListResponse)
async def get_files(
    parent_id: Optional[int] = Query(None, description="父文件夹ID，null表示根目录"),
    file_type: Optional[FileType] = Query(None, description="文件类型筛选"),
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(50, ge=1, le=200, description="返回的最大记录数"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取文件列表"""
    files, total = FileService.get_files(db, current_user, parent_id, file_type, skip, limit)
    return FileListResponse(
        files=[FileSchema.model_validate(f) for f in files],
        total=total
    )

@router.post("/folder", response_model=FileSchema, status_code=201)
async def create_folder(
    folder_data: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建文件夹"""
    folder = FileService.create_folder(db, current_user, folder_data)
    return FileSchema.model_validate(folder)

@router.post("/upload", response_model=FileSchema, status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    parent_id: Optional[str] = Form(None, description="上传到哪个文件夹"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """上传文件"""
    parent_id_int = None
    if parent_id and parent_id.strip():
        try:
            parent_id_int = int(parent_id.strip())
        except ValueError:
            pass
    
    uploaded_file = await FileService.upload_file(db, current_user, file, parent_id_int)
    
    # 检查存储配额：上传后若超出则回滚
    storage = FileService.get_storage_usage(db, current_user)
    if storage["used"] > storage["total"]:
        FileService.delete_file(db, current_user, uploaded_file.id, permanent=True)
        raise HTTPException(
            status_code=413,
            detail=f"存储空间不足。已用 {storage['used'] / 1073741824:.1f} GB（含待上传文件）超出配额 {storage['total'] / 1073741824:.1f} GB"
        )

    return FileSchema.model_validate(uploaded_file)

@router.get("/download/{file_id}")
async def download_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """下载文件"""
    file = FileService.get_file_by_id(db, file_id, current_user)
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")

    if file.is_folder:
        raise HTTPException(status_code=400, detail="文件夹无法下载")

    file_path = get_file_path(current_user.id, file.path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    return FileResponse(
        path=str(file_path),
        media_type="application/octet-stream",
        filename=file.name
    )

@router.get("/preview/{file_id}")
async def preview_file(
    file_id: int,
    request: Request,
    token: Optional[str] = Query(None),
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """preview file"""
    if not current_user and token:
        from app.utils.security import decode_token
        payload = decode_token(token)
        if payload and payload.get("sub"):
            user_id = int(payload["sub"])
            current_user = db.query(User).filter(User.id == user_id).first()
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    file = FileService.get_file_by_id(db, file_id, current_user)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    if file.is_folder:
        raise HTTPException(status_code=400, detail="Cannot preview folder")
    file_path = get_file_path(current_user.id, file.path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    mime_type, _ = mimetypes.guess_type(str(file_path))
    if mime_type is None:
        mime_type = "application/octet-stream"
    return FileResponse(
        path=str(file_path),
        media_type=mime_type,
        filename=file.name
    )

@router.get("/thumbnail/{file_id}")
async def get_thumbnail(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取文件缩略图（仅图片文件）"""
    file = FileService.get_file_by_id(db, file_id, current_user)
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    if file.is_folder:
        raise HTTPException(status_code=400, detail="文件夹无缩略图")
    
    extension = get_file_extension(file.name)
    if not is_image_file(extension):
        raise HTTPException(status_code=400, detail="非图片文件无缩略图")
    
    thumbnail_path = thumbnail_service.get_full_thumbnail_path(current_user.id, file.id, extension)
    if not thumbnail_path.exists():
        file_path = get_file_path(current_user.id, file.path)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="源文件不存在")
        thumbnail_service.generate_thumbnail(str(file_path), str(thumbnail_path))
        if not thumbnail_path.exists():
            raise HTTPException(status_code=500, detail="缩略图生成失败")
    
    mime_type, _ = mimetypes.guess_type(str(thumbnail_path))
    if mime_type is None:
        mime_type = "image/jpeg"
    
    return FileResponse(
        path=str(thumbnail_path),
        media_type=mime_type,
        filename=f"{file.name}_thumb{extension}"
    )


@router.put("/{file_id}", response_model=FileSchema)
async def update_file(
    file_id: int,
    update_data: FileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新文件（重命名/移动）"""
    file = FileService.update_file(db, current_user, file_id, update_data)
    return FileSchema.model_validate(file)

@router.delete("/{file_id}", response_model=MessageResponse)
async def delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除文件或文件夹"""
    FileService.delete_file(db, current_user, file_id)
    return MessageResponse(message="删除成功")

@router.get("/trash", response_model=FileListResponse)
async def get_trash_files(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(50, ge=1, le=200, description="返回的最大记录数"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取回收站文件"""
    files, total = FileService.get_trash_files(db, current_user, skip, limit)
    return FileListResponse(
        files=[FileSchema.model_validate(f) for f in files],
        total=total
    )

@router.post("/{file_id}/restore", response_model=FileSchema)
async def restore_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """恢复文件"""
    file = FileService.restore_file(db, current_user, file_id)
    return FileSchema.model_validate(file)

@router.delete("/{file_id}/permanent", response_model=MessageResponse)
async def permanent_delete_file(
    file_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """永久删除文件"""
    FileService.delete_file(db, current_user, file_id, permanent=True)
    return MessageResponse(message="永久删除成功")



@router.get("/storage", response_model=StorageInfo)
async def get_storage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户存储使用情况"""
    return FileService.get_storage_usage(db, current_user)

@router.get("/search", response_model=FileListResponse)
async def search_files(
    q: str = Query(..., description="搜索关键词"),
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(50, ge=1, le=200, description="返回的最大记录数"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """搜索文件"""
    files, total = FileService.search_files(db, current_user, q, skip, limit)
    return FileListResponse(
        files=[FileSchema.model_validate(f) for f in files],
        total=total
    )
