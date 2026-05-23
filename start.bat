@echo off
REM 罐头文件管理系统 - 启动脚本

REM 设置环境变量
REM 请在生产环境中设置以下环境变量：
REM - DATABASE_PASSWORD: 数据库密码
REM - SECRET_KEY: JWT 密钥（必须设置，建议使用至少32位的随机字符串）

REM 设置 SECRET_KEY（示例，生产环境请使用更安全的密钥）
if not defined SECRET_KEY (
    set SECRET_KEY=dev-secret-key-please-change-in-production-12345678901234567890
)

REM 设置数据库密码（示例，请根据实际情况修改）
if not defined DATABASE_PASSWORD (
    set DATABASE_PASSWORD=123456
)

echo ========================================
echo 罐头文件管理系统
echo ========================================
echo.
echo 环境配置:
echo - 数据库密码: %DATABASE_PASSWORD%
echo - JWT密钥: 已设置（生产环境请使用更安全的密钥）
echo.
echo 正在启动服务器...
echo.

REM 启动后端
cd /d "%~dp0backend"
start "后端服务" cmd /k "uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

REM 等待后端启动
timeout /t 3 /nobreak > nul

REM 启动前端
cd /d "%~dp0frontend"
start "前端服务" cmd /k "npm run dev"

echo.
echo 服务器已启动！
echo - 后端: http://localhost:8000
echo - 前端: http://localhost:5173
echo.
echo 按任意键关闭此窗口...
pause > nul
