import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.database import engine
from app.models import user, file
from app.routers import auth, files, admin_auth, admin_users, admin_files, admin_dashboard, admin_settings, admin_audit_logs
from app.utils.rate_limit import get_limiter

# Create tables
user.Base.metadata.create_all(bind=engine)
file.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="罐头文件管理器",
    description="罐头文件管理器",
    version="1.0.0"
)

# Rate limiter
limiter = get_limiter()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router)
app.include_router(files.router)
app.include_router(admin_auth.router)
app.include_router(admin_users.router)
app.include_router(admin_files.router)
app.include_router(admin_dashboard.router)
app.include_router(admin_settings.router)
app.include_router(admin_audit_logs.router)

@app.get("/")
async def root():
    return {"message": "罐头文件管理器", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

