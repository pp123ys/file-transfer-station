from fastapi import APIRouter

router = APIRouter(prefix="/api/files", tags=["文件"])
# 文件路由将在第二阶段实现