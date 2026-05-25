from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.schemas.file import (
    FileResponse as FileSchema, FileListResponse, FolderCreate,
    FileUpdate, MessageResponse, FileType
)
from app.services.file import FileService
from app.utils.security import get_current_user, get_user_from_token
from app.utils.file import get_file_path
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """预览文件"""
    file = FileService.get_file_by_id(db, file_id, current_user)
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")

    if file.is_folder:
        raise HTTPException(status_code=400, detail="文件夹无法预览")

    file_path = get_file_path(current_user.id, file.path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    mime_type, _ = mimetypes.guess_type(str(file_path))
    if mime_type is None:
        mime_type = "application/octet-stream"

    return FileResponse(
        path=str(file_path),
        media_type=mime_type,
        filename=file.name
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
