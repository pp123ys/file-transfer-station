from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, UploadFile, status
from app.models.file import File
from app.models.user import User
from app.schemas.file import FileCreate, FolderCreate, FileUpdate, FileResponse
from app.utils.file import save_upload_file, delete_physical_file, get_user_storage_path
import shutil

class FileService:
    """文件服务"""
    
    @staticmethod
    def get_files(db: Session, user: User, parent_id: Optional[int] = None) -> List[File]:
        """获取文件列表"""
        query = db.query(File).filter(File.user_id == user.id)
        
        if parent_id is None:
            query = query.filter(File.parent_id == None)
        else:
            query = query.filter(File.parent_id == parent_id)
        
        return query.order_by(File.is_folder.desc(), File.name).all()
    
    @staticmethod
    def get_file_by_id(db: Session, file_id: int, user: User) -> Optional[File]:
        """根据ID获取文件"""
        return db.query(File).filter(
            File.id == file_id,
            File.user_id == user.id
        ).first()
    
    @staticmethod
    def create_folder(db: Session, user: User, folder_data: FolderCreate) -> File:
        """创建文件夹"""
        # 检查同名文件是否存在
        existing = db.query(File).filter(
            File.user_id == user.id,
            File.parent_id == folder_data.parent_id,
            File.name == folder_data.name,
            File.is_folder == True
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="文件夹已存在"
            )
        
        # 创建文件夹记录
        db_folder = File(
            user_id=user.id,
            name=folder_data.name,
            path="",  # 文件夹不需要path
            is_folder=True,
            parent_id=folder_data.parent_id
        )
        db.add(db_folder)
        db.commit()
        db.refresh(db_folder)
        
        return db_folder
    
    @staticmethod
    async def upload_file(db: Session, user: User, upload_file: UploadFile, parent_id: Optional[int] = None) -> File:
        """上传文件"""
        # 保存物理文件
        db_path, file_size = await save_upload_file(upload_file, user.id)
        
        # 检查同名文件是否存在
        existing = db.query(File).filter(
            File.user_id == user.id,
            File.parent_id == parent_id,
            File.name == upload_file.filename,
            File.is_folder == False
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="文件已存在"
            )
        
        # 创建文件记录
        db_file = File(
            user_id=user.id,
            name=upload_file.filename,
            path=db_path,
            is_folder=False,
            size=file_size,
            parent_id=parent_id
        )
        db.add(db_file)
        db.commit()
        db.refresh(db_file)
        
        return db_file
    
    @staticmethod
    def update_file(db: Session, user: User, file_id: int, update_data: FileUpdate) -> File:
        """更新文件（重命名/移动）"""
        file = FileService.get_file_by_id(db, file_id, user)
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="文件不存在"
            )
        
        # 如果要重命名
        if update_data.name and update_data.name != file.name:
            # 检查同名文件是否存在（区分文件/文件夹）
            parent_id = update_data.parent_id if update_data.parent_id is not None else file.parent_id
            existing = db.query(File).filter(
                File.user_id == user.id,
                File.parent_id == parent_id,
                File.name == update_data.name,
                File.is_folder == file.is_folder,
                File.id != file_id
            ).first()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="文件名已存在"
                )
            
            file.name = update_data.name
        
        # 如果要移动
        if update_data.parent_id is not None:
            # 检查目标文件夹是否存在且属于当前用户
            if update_data.parent_id != file.id:  # 不能移动到自己的文件夹
                target_folder = FileService.get_file_by_id(db, update_data.parent_id, user)
                if not target_folder or not target_folder.is_folder:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="目标文件夹不存在"
                    )
            
            file.parent_id = update_data.parent_id
        
        # 更新时间戳
        file.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(file)
        
        return file
    
    @staticmethod
    def delete_file(db: Session, user: User, file_id: int) -> None:
        """删除文件或文件夹"""
        file = FileService.get_file_by_id(db, file_id, user)
        if not file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="文件不存在"
            )
        
        # 如果是文件夹，递归删除所有子文件
        if file.is_folder:
            FileService._delete_folder_recursive(db, file)
        else:
            # 删除物理文件
            if file.path:
                delete_physical_file(file.path, user.id)
        
        # 删除文件记录
        db.delete(file)
        db.commit()
    
    @staticmethod
    def _delete_folder_recursive(db: Session, folder: File) -> None:
        """递归删除文件夹及其内容"""
        # 获取所有子文件
        children = db.query(File).filter(File.parent_id == folder.id).all()
        
        for child in children:
            if child.is_folder:
                FileService._delete_folder_recursive(db, child)
            else:
                if child.path:
                    delete_physical_file(child.path, folder.user_id)
                db.delete(child)
        
        db.delete(folder)
    
    @staticmethod
    def search_files(db: Session, user: User, keyword: str) -> List[File]:
        """搜索文件"""
        return db.query(File).filter(
            File.user_id == user.id,
            File.name.contains(keyword)
        ).order_by(File.is_folder.desc(), File.name).all()
