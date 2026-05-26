from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin

router = APIRouter(prefix="/api/admin/announcements", tags=["管理员公告"])


@router.get("", response_model=list[AnnouncementResponse])
async def get_announcements(
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    announcements = db.query(Announcement).order_by(
        Announcement.is_pinned.desc(),
        Announcement.created_at.desc()
    ).all()
    return announcements


@router.post("", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    data: AnnouncementCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ann = Announcement(
        title=data.title,
        content=data.content,
        display_type=data.display_type,
        is_pinned=data.is_pinned,
        is_active=data.is_active,
        created_by=current_admin.id
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann


@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: int,
    data: AnnouncementUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="公告不存在")

    if data.title is not None:
        ann.title = data.title
    if data.content is not None:
        ann.content = data.content
    if data.display_type is not None:
        ann.display_type = data.display_type
    if data.is_pinned is not None:
        ann.is_pinned = data.is_pinned
    if data.is_active is not None:
        ann.is_active = data.is_active

    db.commit()
    db.refresh(ann)
    return ann


@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="公告不存在")

    db.delete(ann)
    db.commit()
    return {"message": "公告已删除"}


@router.patch("/{announcement_id}/toggle")
async def toggle_announcement(
    announcement_id: int,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="公告不存在")

    ann.is_active = not ann.is_active
    db.commit()
    db.refresh(ann)
    return {"message": "状态已切换", "is_active": ann.is_active}
