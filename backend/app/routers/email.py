from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.email import (
    SendVerificationCodeRequest,
    SendVerificationCodeResponse,
    CompleteEmailRequest
)
from app.services.email import EmailService
from app.services.auth import AuthService
from app.models.user import User
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/auth", tags=["email"])

@router.post("/send-verification-code", response_model=SendVerificationCodeResponse)
async def send_verification_code(
    request: SendVerificationCodeRequest,
    db: Session = Depends(get_db)
):
    
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="该邮箱已被注册"
        )
    
    if not EmailService.check_send_frequency(db, request.email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="发送过于频繁，请稍后再试"
        )
    
    code = EmailService.generate_code()
    EmailService.save_verification_code(db, request.email, code)
    
    await EmailService.send_verification_email(db, request.email, code)
    
    return SendVerificationCodeResponse(success=True, message="验证码已发送")

@router.put("/complete-email")
async def complete_email(
    request: CompleteEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    existing_user = db.query(User).filter(
        User.email == request.email,
        User.id != current_user.id
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="该邮箱已被其他用户使用"
        )
    
    if not EmailService.verify_code(db, request.email, request.verification_code):
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="验证码已过期，请重新发送"
        )
    
    AuthService.update_user_email(db, current_user.id, request.email)
    
    EmailService.delete_used_code(db, request.email, request.verification_code)
    
    return {"success": True, "message": "邮箱补全成功"}
