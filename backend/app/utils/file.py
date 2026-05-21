import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from app.config import STORAGE_PATH, MAX_FILE_SIZE, ALLOWED_EXTENSIONS

def get_user_storage_path(user_id: int) -> Path:
    """获取用户的存储路径"""
    storage_path = Path(STORAGE_PATH) / "users" / str(user_id) / "files"
    storage_path.mkdir(parents=True, exist_ok=True)
    return storage_path

def generate_unique_filename(original_filename: str) -> str:
    """生成唯一的文件名"""
    ext = Path(original_filename).suffix
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return unique_name

def get_file_extension(filename: str) -> str:
    """获取文件扩展名"""
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str) -> bool:
    """检查文件类型是否允许"""
    ext = get_file_extension(filename)
    return ext in ALLOWED_EXTENSIONS

def get_file_path(user_id: int, db_path: str) -> Path:
    """根据数据库路径获取物理文件路径"""
    base_path = get_user_storage_path(user_id)
    return base_path / db_path

def validate_filename(filename: str) -> bool:
    """验证文件名（防止路径遍历）"""
    dangerous_chars = ['..', '/', '\\', '\x00']
    return not any(char in filename for char in dangerous_chars)

async def save_upload_file(upload_file: UploadFile, user_id: int) -> tuple[str, int]:
    """保存上传的文件，返回(db_path, file_size)"""
    if not upload_file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件名不能为空"
        )
    
    if not validate_filename(upload_file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件名包含非法字符"
        )
    
    if not is_allowed_file(upload_file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型，仅支持: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    storage_path = get_user_storage_path(user_id)
    unique_filename = generate_unique_filename(upload_file.filename)
    file_path = storage_path / unique_filename
    
    file_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await upload_file.read(8192):
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                buffer.close()
                os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"文件大小超过限制 ({MAX_FILE_SIZE // (1024*1024)}MB)"
                )
            buffer.write(chunk)
    
    return unique_filename, file_size

def delete_physical_file(file_path: str, user_id: int) -> None:
    """删除物理文件"""
    full_path = get_file_path(user_id, file_path)
    if full_path.exists():
        os.remove(full_path)
