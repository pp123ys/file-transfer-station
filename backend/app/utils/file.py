import os
import uuid
import mimetypes
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from app.config import STORAGE_PATH, MAX_FILE_SIZE, ALLOWED_EXTENSIONS
from sqlalchemy.orm import Session

ALLOWED_MIME_TYPES = {
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/markdown',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4',
    'video/mp4', 'video/webm', 'video/avi',
    'application/json', 'application/xml'
}

BLOCKED_EXTENSIONS = {'exe', 'bat', 'sh', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar'}

IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'}

def is_allowed_file_type(mime_type: str, extension: str) -> bool:
    if extension.lower().lstrip('.') in BLOCKED_EXTENSIONS:
        return False
    return mime_type in ALLOWED_MIME_TYPES

def validate_file_type(mime_type: str, extension: str) -> Tuple[bool, str]:
    ext_without_dot = extension.lower().lstrip('.')
    if ext_without_dot in BLOCKED_EXTENSIONS:
        return False, f"禁止的文件类型：.{extension}"
    if mime_type not in ALLOWED_MIME_TYPES:
        return False, f"不支持的文件类型：{mime_type}"
    return True, ""

def is_image_file(extension: str) -> bool:
    return extension.lower() in IMAGE_EXTENSIONS

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

async def save_upload_file(upload_file: UploadFile, user_id: int, db: Session = None) -> Tuple[str, int, str]:
    """保存上传的文件，返回(db_path, file_size, mime_type)"""
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
    
    mime_type, _ = mimetypes.guess_type(str(file_path))
    if mime_type is None:
        mime_type = "application/octet-stream"
    
    extension = get_file_extension(upload_file.filename)
    is_valid, error_msg = validate_file_type(mime_type, extension)
    if not is_valid:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    return unique_filename, file_size, mime_type

def delete_physical_file(file_path: str, user_id: int) -> None:
    """删除物理文件"""
    full_path = get_file_path(user_id, file_path)
    if full_path.exists():
        os.remove(full_path)

def delete_thumbnail_file(file_id: int, user_id: int, extension: str) -> None:
    """删除缩略图文件"""
    thumbnail_dir = Path(STORAGE_PATH) / "thumbnails" / str(user_id)
    thumbnail_path = thumbnail_dir / f"{file_id}_thumb{extension}"
    if thumbnail_path.exists():
        os.remove(thumbnail_path)
