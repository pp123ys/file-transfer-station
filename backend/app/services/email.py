import logging
import random
from datetime import datetime, timedelta
from app.database import beijing_now
from typing import Optional
from sqlalchemy.orm import Session
from app.models.email_code import EmailVerificationCode
from app.services.config import ConfigService

logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def generate_code() -> str:
        """生成6位验证码"""
        return str(random.randint(100000, 999999))

    @staticmethod
    def save_verification_code(db: Session, email: str, code: str, expires_minutes: int = 10):
        """保存验证码到数据库"""
        expires_at = beijing_now() + timedelta(minutes=expires_minutes)
        verification = EmailVerificationCode(
            email=email,
            code=code,
            expires_at=expires_at
        )
        db.add(verification)
        db.commit()

    @staticmethod
    def verify_code(db: Session, email: str, code: str) -> bool:
        """验证验证码是否正确且未过期"""
        verification = db.query(EmailVerificationCode).filter(
            EmailVerificationCode.email == email,
            EmailVerificationCode.code == code,
            EmailVerificationCode.expires_at > beijing_now()
        ).first()
        return verification is not None

    @staticmethod
    def delete_used_code(db: Session, email: str, code: str):
        """删除已使用的验证码"""
        db.query(EmailVerificationCode).filter(
            EmailVerificationCode.email == email,
            EmailVerificationCode.code == code
        ).delete()
        db.commit()

    @staticmethod
    def check_send_frequency(db: Session, email: str, max_count: int = 3, window_minutes: int = 10) -> bool:
        """检查发送频率，同一邮箱10分钟内最多发送max_count次"""
        window_start = beijing_now() - timedelta(minutes=window_minutes)
        count = db.query(EmailVerificationCode).filter(
            EmailVerificationCode.email == email,
            EmailVerificationCode.created_at >= window_start
        ).count()
        return count < max_count

    @staticmethod
    async def send_verification_email(db: Session, to_email: str, code: str) -> bool:
        """发送验证码邮件"""
        email_enabled = ConfigService.get_config(db, "email_enabled", "false")
        
        if email_enabled == "true":
            smtp_host = ConfigService.get_config(db, "smtp_host")
            smtp_port = int(ConfigService.get_config(db, "smtp_port", "587"))
            smtp_username = ConfigService.get_config(db, "smtp_username")
            smtp_password = ConfigService.get_config(db, "smtp_password")
            smtp_from_email = ConfigService.get_config(db, "smtp_from_email", smtp_username)
            smtp_from_name = ConfigService.get_config(db, "smtp_from_name", "File Transfer Station")
            
            if not all([smtp_host, smtp_username, smtp_password]):
                logger.error("SMTP configuration is incomplete")
                return False
            
            try:
                import aiosmtplib
                from email.message import EmailMessage
                
                message = EmailMessage()
                message["From"] = f"{smtp_from_name} <{smtp_from_email}>"
                message["To"] = to_email
                message["Subject"] = "验证码"
                message.set_content(f"您的验证码是：{code}，10分钟内有效。")
                
                await aiosmtplib.send(
                    message,
                    hostname=smtp_host,
                    port=smtp_port,
                    username=smtp_username,
                    password=smtp_password,
                    start_tls=True
                )
                logger.info(f"Verification code sent to {to_email}")
                return True
            except Exception as e:
                logger.error(f"Failed to send email: {e}")
                return False
        else:
            logger.info(f"[DEV] Verification code for {to_email}: {code}")
            return True

    @staticmethod
    async def send_test_email(db: Session, to_email: str) -> bool:
        """发送测试邮件"""
        return await EmailService.send_verification_email(db, to_email, "TEST")
