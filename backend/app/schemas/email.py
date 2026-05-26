from pydantic import BaseModel, EmailStr
from typing import Optional

class SendVerificationCodeRequest(BaseModel):
    email: EmailStr

class SendVerificationCodeResponse(BaseModel):
    success: bool
    message: str

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    verification_code: str

class CompleteEmailRequest(BaseModel):
    email: EmailStr
    verification_code: str

class EmailConfigResponse(BaseModel):
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_from_email: Optional[str] = None
    smtp_from_name: Optional[str] = None
    email_enabled: bool = False
