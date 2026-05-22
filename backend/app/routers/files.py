from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.schemas.file import (
    FileResponse as FileSchema, FileListResponse, FolderCreate,
    FileUpdate, MessageResponse
)
from app.services.file import FileService
from app.utils.security import get_current_user
from app.utils.file import get_file_path

router = APIRouter(prefix="/api/files", tags=["文件"])

@router.get("", response_model=FileListResponse)
async def get_files(
    parent_id: Optional[int] = Query(None, description="父文件夹ID，null表示根目录"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取文件列表"""
    files = FileService.get_files(db, current_user, parent_id)
    return FileListResponse(files=[
        FileSchema.model_validate(f) for f in files
    ])

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
    # 处理 parent_id 的类型转换
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

@router.get("/search", response_model=FileListResponse)
async def search_files(
    q: str = Query(..., description="搜索关键词"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """搜索文件"""
    files = FileService.search_files(db, current_user, q)
    return FileListResponse(files=[
        FileSchema.model_validate(f) for f in files
    ])
