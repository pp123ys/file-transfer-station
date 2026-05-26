from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.announcement import Announcement, AnnouncementDismissal
from app.schemas.announcement import AnnouncementResponse
from app.utils.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/announcements", tags=["公告"])


@router.get("/active", response_model=list[AnnouncementResponse])
async def get_active_announcements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    all_active = db.query(Announcement).filter(
        Announcement.is_active == True
    ).order_by(
        Announcement.is_pinned.desc(),
        Announcement.created_at.desc()
    ).all()

    dismissed_ids_query = db.query(AnnouncementDismissal.announcement_id).filter(
        AnnouncementDismissal.user_id == current_user.id
    )
    dismissed_ids = {row[0] for row in dismissed_ids_query.all()}

    result = []
    for ann in all_active:
        if ann.display_type == "modal":
            result.append(ann)
        elif ann.id not in dismissed_ids:
            result.append(ann)

    return result


@router.post("/{announcement_id}/dismiss")
async def dismiss_announcement(
    announcement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="公告不存在")

    if ann.display_type != "banner":
        raise HTTPException(status_code=400, detail="弹窗类公告无需关闭")

    existing = db.query(AnnouncementDismissal).filter(
        AnnouncementDismissal.announcement_id == announcement_id,
        AnnouncementDismissal.user_id == current_user.id
    ).first()

    if not existing:
        dismissal = AnnouncementDismissal(
            announcement_id=announcement_id,
            user_id=current_user.id
        )
        db.add(dismissal)
        db.commit()

    return {"message": "已关闭"}
