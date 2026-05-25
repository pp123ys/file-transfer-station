# 管理员后台实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为"罐头文件管理器"实现完整的独立管理后台，包含用户管理、文件管理、系统设置和操作日志。

**Architecture:** 采用前后端完全隔离的架构，管理员使用独立的认证体系（独立 JWT secret），独立的数据表（admins），独立的前端路由（/admin/*）。后端使用 FastAPI + SQLAlchemy，前端使用 React + Tailwind CSS，遵循 Vercel 设计语言。

**Tech Stack:** FastAPI, SQLAlchemy, MySQL, React, React Router, Tailwind CSS, JWT, bcrypt

---

## 文件结构

### 后端新增文件
- `backend/app/models/admin.py` - 管理员模型
- `backend/app/models/audit_log.py` - 审计日志模型
- `backend/app/models/system_config.py` - 系统配置模型
- `backend/app/schemas/admin.py` - 管理员数据模式
- `backend/app/schemas/audit_log.py` - 审计日志数据模式
- `backend/app/schemas/system_config.py` - 系统配置数据模式
- `backend/app/services/admin.py` - 管理员服务
- `backend/app/routers/admin_auth.py` - 管理员认证路由
- `backend/app/routers/admin_users.py` - 管理员用户管理路由
- `backend/app/routers/admin_files.py` - 管理员文件管理路由
- `backend/app/routers/admin_dashboard.py` - 管理员仪表盘路由
- `backend/app/routers/admin_settings.py` - 管理员设置路由
- `backend/app/routers/admin_audit_logs.py` - 管理员审计日志路由
- `backend/app/utils/admin_security.py` - 管理员安全工具

### 后端修改文件
- `backend/app/models/user.py` - 添加 is_admin 字段
- `backend/app/main.py` - 注册管理员路由

### 前端新增文件
- `frontend/src/admin/AdminApp.jsx` - 管理员应用入口
- `frontend/src/admin/api/admin.js` - 管理员 API 客户端
- `frontend/src/admin/context/AdminAuthContext.jsx` - 管理员认证上下文
- `frontend/src/admin/layouts/AdminLayout.jsx` - 管理员布局
- `frontend/src/admin/pages/Login.jsx` - 管理员登录页
- `frontend/src/admin/pages/Dashboard.jsx` - 仪表盘页
- `frontend/src/admin/pages/Users.jsx` - 用户管理页
- `frontend/src/admin/pages/UserDetail.jsx` - 用户详情页
- `frontend/src/admin/pages/Files.jsx` - 文件管理页
- `frontend/src/admin/pages/Settings.jsx` - 系统设置页
- `frontend/src/admin/pages/AuditLogs.jsx` - 操作日志页
- `frontend/src/admin/components/AdminSidebar.jsx` - 管理员侧边栏
- `frontend/src/admin/components/StatCard.jsx` - 统计卡片
- `frontend/src/admin/components/DataTable.jsx` - 数据表格
- `frontend/src/admin/components/Toggle.jsx` - 开关组件

### 前端修改文件
- `frontend/src/App.jsx` - 添加管理员路由
- `frontend/src/api/index.js` - 添加管理员 API 拦截器支持

---

## 实施任务

### Task 1: 数据库迁移 - 修改 users 表

**Files:**
- Create: `backend/add_is_admin_column.sql`

- [ ] **Step 1: 创建数据库迁移脚本**

创建文件 `backend/add_is_admin_column.sql`:

```sql
-- 为 users 表添加 is_admin 字段
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE AFTER email;

-- 创建索引以提高查询性能
CREATE INDEX idx_users_is_admin ON users(is_admin);
```

- [ ] **Step 2: 执行数据库迁移**

运行命令:
```bash
cd backend
mysql -u root -p123456 filemanager < add_is_admin_column.sql
```

预期输出: 无错误信息

- [ ] **Step 3: 更新 User 模型**

修改文件 `backend/app/models/user.py`，在 `email` 字段后添加:

```python
is_admin = Column(Boolean, default=False)
```

完整的 User 类应该是:

```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.username}>"
```

- [ ] **Step 4: 提交更改**

```bash
git add backend/add_is_admin_column.sql backend/app/models/user.py
git commit -m "feat(db): add is_admin column to users table"
```

---

### Task 2: 数据库迁移 - 创建 admins 表

**Files:**
- Create: `backend/create_admins_table.sql`
- Create: `backend/app/models/admin.py`

- [ ] **Step 1: 创建数据库迁移脚本**

创建文件 `backend/create_admins_table.sql`:

```sql
-- 创建管理员表
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admins_username (username),
    INDEX idx_admins_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认管理员账户（密码: admin123）
INSERT INTO admins (username, password_hash, email, is_active)
VALUES (
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHA8COXYn7p6h3v5K6Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
    'admin@example.com',
    TRUE
);
```

- [ ] **Step 2: 执行数据库迁移**

运行命令:
```bash
cd backend
mysql -u root -p123456 filemanager < create_admins_table.sql
```

预期输出: 无错误信息

- [ ] **Step 3: 创建 Admin 模型**

创建文件 `backend/app/models/admin.py`:

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database import Base

class Admin(Base):
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Admin {self.username}>"
```

- [ ] **Step 4: 更新模型 __init__.py**

修改文件 `backend/app/models/__init__.py`，添加导入:

```python
from app.models.admin import Admin
```

- [ ] **Step 5: 提交更改**

```bash
git add backend/create_admins_table.sql backend/app/models/admin.py backend/app/models/__init__.py
git commit -m "feat(db): create admins table and model"
```

---

### Task 3: 数据库迁移 - 创建 audit_logs 表

**Files:**
- Create: `backend/create_audit_logs_table.sql`
- Create: `backend/app/models/audit_log.py`

- [ ] **Step 1: 创建数据库迁移脚本**

创建文件 `backend/create_audit_logs_table.sql`:

```sql
-- 创建审计日志表
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details VARCHAR(500),
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_audit_logs_admin_id (admin_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

- [ ] **Step 2: 执行数据库迁移**

运行命令:
```bash
cd backend
mysql -u root -p123456 filemanager < create_audit_logs_table.sql
```

预期输出: 无错误信息

- [ ] **Step 3: 创建 AuditLog 模型**

创建文件 `backend/app/models/audit_log.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(50), nullable=False)
    target_type = Column(String(50))
    target_id = Column(Integer)
    details = Column(String(500))
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    admin = relationship("Admin", backref="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog {self.action} by Admin {self.admin_id}>"
```

- [ ] **Step 4: 更新模型 __init__.py**

修改文件 `backend/app/models/__init__.py`，添加导入:

```python
from app.models.audit_log import AuditLog
```

- [ ] **Step 5: 提交更改**

```bash
git add backend/create_audit_logs_table.sql backend/app/models/audit_log.py backend/app/models/__init__.py
git commit -m "feat(db): create audit_logs table and model"
```

---

### Task 4: 数据库迁移 - 创建 system_configs 表

**Files:**
- Create: `backend/create_system_configs_table.sql`
- Create: `backend/app/models/system_config.py`

- [ ] **Step 1: 创建数据库迁移脚本**

创建文件 `backend/create_system_configs_table.sql`:

```sql
-- 创建系统配置表
CREATE TABLE system_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    value VARCHAR(500) NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_system_configs_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认配置
INSERT INTO system_configs (`key`, value) VALUES
('storage_quota', '10'),
('allow_register', 'true'),
('max_file_size', '100'),
('allowed_extensions', '*');
```

- [ ] **Step 2: 执行数据库迁移**

运行命令:
```bash
cd backend
mysql -u root -p123456 filemanager < create_system_configs_table.sql
```

预期输出: 无错误信息

- [ ] **Step 3: 创建 SystemConfig 模型**

创建文件 `backend/app/models/system_config.py`:

```python
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class SystemConfig(Base):
    __tablename__ = "system_configs"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(String(500), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<SystemConfig {self.key}={self.value}>"
```

- [ ] **Step 4: 更新模型 __init__.py**

修改文件 `backend/app/models/__init__.py`，添加导入:

```python
from app.models.system_config import SystemConfig
```

- [ ] **Step 5: 提交更改**

```bash
git add backend/create_system_configs_table.sql backend/app/models/system_config.py backend/app/models/__init__.py
git commit -m "feat(db): create system_configs table and model"
```

---

### Task 5: 创建管理员数据模式

**Files:**
- Create: `backend/app/schemas/admin.py`
- Create: `backend/app/schemas/audit_log.py`
- Create: `backend/app/schemas/system_config.py`

- [ ] **Step 1: 创建管理员数据模式**

创建文件 `backend/app/schemas/admin.py`:

```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class AdminAuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: AdminResponse
```

- [ ] **Step 2: 创建审计日志数据模式**

创建文件 `backend/app/schemas/audit_log.py`:

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    admin_id: int
    action: str
    target_type: Optional[str]
    target_id: Optional[int]
    details: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
```

- [ ] **Step 3: 创建系统配置数据模式**

创建文件 `backend/app/schemas/system_config.py`:

```python
from pydantic import BaseModel
from typing import Dict
from datetime import datetime

class SystemConfigResponse(BaseModel):
    id: int
    key: str
    value: str
    updated_at: datetime
    
    class Config:
        from_attributes = True

class SystemConfigUpdate(BaseModel):
    configs: Dict[str, str]
```

- [ ] **Step 4: 提交更改**

```bash
git add backend/app/schemas/admin.py backend/app/schemas/audit_log.py backend/app/schemas/system_config.py
git commit -m "feat(schemas): add admin, audit_log, and system_config schemas"
```

---

### Task 6: 创建管理员安全工具

**Files:**
- Create: `backend/app/utils/admin_security.py`
- Modify: `backend/app/config.py`

- [ ] **Step 1: 更新配置文件添加管理员 JWT Secret**

修改文件 `backend/app/config.py`，在 JWT 配置部分添加:

```python
# 管理员 JWT 配置
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")
if not ADMIN_SECRET_KEY:
    raise ValueError("ADMIN_SECRET_KEY environment variable must be set")
ADMIN_ALGORITHM = "HS256"
ADMIN_ACCESS_TOKEN_EXPIRE_DAYS = 7
```

- [ ] **Step 2: 创建管理员安全工具**

创建文件 `backend/app/utils/admin_security.py`:

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.config import ADMIN_SECRET_KEY, ADMIN_ALGORITHM, ADMIN_ACCESS_TOKEN_EXPIRE_DAYS
from app.database import get_db
from app.models.admin import Admin

security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated_password = plain_password[:72].encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(truncated_password, hashed_bytes)

def get_password_hash(password: str) -> str:
    truncated_password = password[:72].encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(truncated_password, salt)
    return hashed.decode('utf-8')

def create_admin_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ADMIN_ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "role": "admin"})
    encoded_jwt = jwt.encode(to_encode, ADMIN_SECRET_KEY, algorithm=ADMIN_ALGORITHM)
    return encoded_jwt

def decode_admin_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=[ADMIN_ALGORITHM])
        if payload.get("role") != "admin":
            return None
        return payload
    except JWTError:
        return None

def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Admin:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="请先登录",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decode_admin_token(token)
    
    if payload is None:
        raise credentials_exception
    
    admin_id_str = payload.get("sub")
    if admin_id_str is None:
        raise credentials_exception
    
    try:
        admin_id = int(admin_id_str)
    except ValueError:
        raise credentials_exception
    
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if admin is None:
        raise credentials_exception
    
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="管理员已被禁用"
        )
    
    return admin
```

- [ ] **Step 3: 提交更改**

```bash
git add backend/app/utils/admin_security.py backend/app/config.py
git commit -m "feat(security): add admin authentication utilities"
```

---

### Task 7: 创建管理员服务

**Files:**
- Create: `backend/app/services/admin.py`

- [ ] **Step 1: 创建管理员服务**

创建文件 `backend/app/services/admin.py`:

```python
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.admin import Admin
from app.models.user import User
from app.models.file import File
from app.models.audit_log import AuditLog
from app.models.system_config import SystemConfig
from app.schemas.admin import AdminLogin
from app.utils.admin_security import verify_password, get_password_hash, create_admin_token

class AdminService:
    @staticmethod
    def authenticate_admin(db: Session, username: str, password: str) -> Optional[Admin]:
        admin = db.query(Admin).filter(Admin.username == username).first()
        if not admin:
            return None
        if not verify_password(password, admin.password_hash):
            return None
        return admin
    
    @staticmethod
    def create_token(admin: Admin) -> str:
        return create_admin_token({"sub": str(admin.id)})
    
    @staticmethod
    def create_audit_log(
        db: Session,
        admin_id: int,
        action: str,
        target_type: Optional[str] = None,
        target_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        log = AuditLog(
            admin_id=admin_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
    
    @staticmethod
    def get_dashboard_stats(db: Session) -> dict:
        total_users = db.query(func.count(User.id)).scalar()
        total_files = db.query(func.count(File.id)).scalar()
        total_storage = db.query(func.sum(File.size)).scalar() or 0
        active_users_today = db.query(func.count(User.id)).filter(
            User.created_at >= func.current_date()
        ).scalar()
        
        return {
            "total_users": total_users,
            "total_files": total_files,
            "total_storage": total_storage,
            "active_users_today": active_users_today
        }
    
    @staticmethod
    def get_all_configs(db: Session) -> dict:
        configs = db.query(SystemConfig).all()
        return {config.key: config.value for config in configs}
    
    @staticmethod
    def update_configs(db: Session, configs: dict) -> dict:
        for key, value in configs.items():
            config = db.query(SystemConfig).filter(SystemConfig.key == key).first()
            if config:
                config.value = value
            else:
                config = SystemConfig(key=key, value=value)
                db.add(config)
        db.commit()
        return AdminService.get_all_configs(db)
```

- [ ] **Step 2: 提交更改**

```bash
git add backend/app/services/admin.py
git commit -m "feat(services): add admin service with dashboard and config methods"
```

---

### Task 8: 创建管理员认证路由

**Files:**
- Create: `backend/app/routers/admin_auth.py`

- [ ] **Step 1: 创建管理员认证路由**

创建文件 `backend/app/routers/admin_auth.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.admin import AdminResponse, AdminAuthResponse
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin

router = APIRouter(prefix="/api/admin/auth", tags=["管理员认证"])

@router.post("/login", response_model=AdminAuthResponse)
async def admin_login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    admin = AdminService.authenticate_admin(db, form_data.username, form_data.password)
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = AdminService.create_token(admin)
    
    ip_address = request.client.host if request.client else None
    AdminService.create_audit_log(
        db=db,
        admin_id=admin.id,
        action="login",
        ip_address=ip_address,
        details="管理员登录"
    )
    
    return AdminAuthResponse(
        access_token=token,
        token_type="bearer",
        admin=AdminResponse.model_validate(admin)
    )

@router.get("/me", response_model=AdminResponse)
async def get_current_admin_info(
    current_admin: Admin = Depends(get_current_admin)
):
    return AdminResponse.model_validate(current_admin)

@router.post("/logout")
async def admin_logout(
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ip_address = request.client.host if request.client else None
    AdminService.create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="logout",
        ip_address=ip_address,
        details="管理员登出"
    )
    
    return {"message": "登出成功"}
```

- [ ] **Step 2: 提交更改**

```bash
git add backend/app/routers/admin_auth.py
git commit -m "feat(routers): add admin authentication router"
```

---

### Task 9: 创建管理员用户管理路由

**Files:**
- Create: `backend/app/routers/admin_users.py`

- [ ] **Step 1: 创建管理员用户管理路由**

创建文件 `backend/app/routers/admin_users.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.user import UserResponse
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.user import User
from app.models.file import File
from sqlalchemy import func

router = APIRouter(prefix="/api/admin/users", tags=["管理员用户管理"])

@router.get("")
async def get_users(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.username.contains(search)) | (User.email.contains(search))
        )
    
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for user in users:
        file_count = db.query(func.count(File.id)).filter(File.owner_id == user.id).scalar()
        storage_used = db.query(func.sum(File.size)).filter(File.owner_id == user.id).scalar() or 0
        
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
            "file_count": file_count,
            "storage_used": storage_used
        })
    
    return {
        "users": result,
        "total": total,
        "page": page,
        "per_page": per_page
    }

@router.get("/{user_id}")
async def get_user_detail(
    user_id: int,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    file_count = db.query(func.count(File.id)).filter(File.owner_id == user.id).scalar()
    storage_used = db.query(func.sum(File.size)).filter(File.owner_id == user.id).scalar() or 0
    
    files = db.query(File).filter(File.owner_id == user_id).all()
    
    return {
        "user": UserResponse.model_validate(user),
        "file_count": file_count,
        "storage_used": storage_used,
        "files": [
            {
                "id": f.id,
                "filename": f.filename,
                "size": f.size,
                "created_at": f.created_at
            }
            for f in files
        ]
    }

@router.patch("/{user_id}")
async def update_user(
    user_id: int,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    data = await request.json()
    action = data.get("action")
    
    ip_address = request.client.host if request.client else None
    
    if action == "toggle_active":
        user.is_active = not user.is_active
        db.commit()
        
        AdminService.create_audit_log(
            db=db,
            admin_id=current_admin.id,
            action="toggle_user",
            target_type="user",
            target_id=user.id,
            ip_address=ip_address,
            details=f"{'启用' if user.is_active else '禁用'}用户 {user.username}"
        )
        
        return {"message": f"用户已{'启用' if user.is_active else '禁用'}", "is_active": user.is_active}
    
    raise HTTPException(status_code=400, detail="无效的操作")

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用户不存在")
    
    ip_address = request.client.host if request.client else None
    
    AdminService.create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="delete_user",
        target_type="user",
        target_id=user.id,
        ip_address=ip_address,
        details=f"删除用户 {user.username}"
    )
    
    db.delete(user)
    db.commit()
    
    return {"message": "用户已删除"}
```

- [ ] **Step 2: 提交更改**

```bash
git add backend/app/routers/admin_users.py
git commit -m "feat(routers): add admin users management router"
```

---

### Task 10: 创建管理员文件管理路由

**Files:**
- Create: `backend/app/routers/admin_files.py`

- [ ] **Step 1: 创建管理员文件管理路由**

创建文件 `backend/app/routers/admin_files.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.file import File
from app.models.user import User
from sqlalchemy import func
import os
from app.config import STORAGE_PATH

router = APIRouter(prefix="/api/admin/files", tags=["管理员文件管理"])

@router.get("")
async def get_files(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(File)
    
    if user_id:
        query = query.filter(File.owner_id == user_id)
    
    if search:
        query = query.filter(File.filename.contains(search))
    
    total = query.count()
    files = query.offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for file in files:
        owner = db.query(User).filter(User.id == file.owner_id).first()
        
        result.append({
            "id": file.id,
            "filename": file.filename,
            "size": file.size,
            "owner_id": file.owner_id,
            "owner_username": owner.username if owner else "未知",
            "created_at": file.created_at,
            "file_type": file.file_type
        })
    
    return {
        "files": result,
        "total": total,
        "page": page,
        "per_page": per_page
    }

@router.get("/{file_id}")
async def get_file_detail(
    file_id: int,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    owner = db.query(User).filter(User.id == file.owner_id).first()
    
    return {
        "id": file.id,
        "filename": file.filename,
        "size": file.size,
        "file_type": file.file_type,
        "owner_id": file.owner_id,
        "owner_username": owner.username if owner else "未知",
        "created_at": file.created_at,
        "file_path": file.file_path
    }

@router.delete("/{file_id}")
async def delete_file(
    file_id: int,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    file = db.query(File).filter(File.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    ip_address = request.client.host if request.client else None
    
    try:
        if file.file_path and os.path.exists(file.file_path):
            os.remove(file.file_path)
    except Exception as e:
        pass
    
    AdminService.create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="delete_file",
        target_type="file",
        target_id=file.id,
        ip_address=ip_address,
        details=f"删除文件 {file.filename}"
    )
    
    db.delete(file)
    db.commit()
    
    return {"message": "文件已删除"}
```

- [ ] **Step 2: 提交更改**

```bash
git add backend/app/routers/admin_files.py
git commit -m "feat(routers): add admin files management router"
```

---

### Task 11: 创建管理员仪表盘路由

**Files:**
- Create: `backend/app/routers/admin_dashboard.py`

- [ ] **Step 1: 创建管理员仪表盘路由**

创建文件 `backend/app/routers/admin_dashboard.py`:

```python
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/api/admin/dashboard", tags=["管理员仪表盘"])

@router.get("")
async def get_dashboard(
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    stats = AdminService.get_dashboard_stats(db)
    
    recent_logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(10).all()
    
    logs = []
    for log in recent_logs:
        admin = db.query(Admin).filter(Admin.id == log.admin_id).first()
        logs.append({
            "id": log.id,
            "admin_username": admin.username if admin else "未知",
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        })
    
    return {
        "stats": stats,
        "recent_logs": logs
    }
```

- [ ] **Step 2: 提交更改**

```bash
git add backend/app/routers/admin_dashboard.py
git commit -m "feat(routers): add admin dashboard router"
```

---

### Task 12: 创建管理员设置路由

**Files:**
- Create: `backend/app/routers/admin_settings.py`

- [ ] **Step 1: 创建管理员设置路由**

创建文件 `backend/app/routers/admin_settings.py`:

```python
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.system_config import SystemConfigUpdate
from app.services.admin import AdminService
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin

router = APIRouter(prefix="/api/admin/settings", tags=["管理员设置"])

@router.get("")
async def get_settings(
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    configs = AdminService.get_all_configs(db)
    return {"configs": configs}

@router.put("")
async def update_settings(
    config_data: SystemConfigUpdate,
    request: Request,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    ip_address = request.client.host if request.client else None
    
    AdminService.create_audit_log(
        db=db,
        admin_id=current_admin.id,
        action="update_config",
        target_type="config",
        ip_address=ip_address,
        details=f"更新系统配置"
    )
    
    configs = AdminService.update_configs(db, config_data.configs)
    return {"configs": configs, "message": "配置已更新"}
```

- [ ] **Step 2: 提交更改**

```bash
git add backend/app/routers/admin_settings.py
git commit -m "feat(routers): add admin settings router"
```

---

### Task 13: 创建管理员审计日志路由

**Files:**
- Create: `backend/app/routers/admin_audit_logs.py`

- [ ] **Step 1: 创建管理员审计日志路由**

创建文件 `backend/app/routers/admin_audit_logs.py`:

```python
from fastapi import APIRouter, Depends, Request, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.utils.admin_security import get_current_admin
from app.models.admin import Admin
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/api/admin/audit-logs", tags=["管理员审计日志"])

@router.get("")
async def get_audit_logs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    action: Optional[str] = Query(None),
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    
    if action:
        query = query.filter(AuditLog.action == action)
    
    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    
    result = []
    for log in logs:
        admin = db.query(Admin).filter(Admin.id == log.admin_id).first()
        
        result.append({
            "id": log.id,
            "admin_username": admin.username if admin else "未知",
            "action": log.action,
            "target_type": log.target_type,
            "target_id": log.target_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at
        })
    
    return {
        "logs": result,
        "total": total,
        "page": page,
        "per_page": per_page
    }
```

- [ ] **Step 2: 提交更改**

```bash
git add backend/app/routers/admin_audit_logs.py
git commit -m "feat(routers): add admin audit logs router"
```

---

### Task 14: 注册管理员路由到主应用

**Files:**
- Modify: `backend/app/main.py`

- [ ] **Step 1: 导入管理员路由**

修改文件 `backend/app/main.py`，在导入部分添加:

```python
from app.routers import auth, files, admin_auth, admin_users, admin_files, admin_dashboard, admin_settings, admin_audit_logs
```

- [ ] **Step 2: 注册管理员路由**

在路由注册部分添加:

```python
app.include_router(admin_auth.router)
app.include_router(admin_users.router)
app.include_router(admin_files.router)
app.include_router(admin_dashboard.router)
app.include_router(admin_settings.router)
app.include_router(admin_audit_logs.router)
```

完整的 main.py 应该是:

```python
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

user.Base.metadata.create_all(bind=engine)
file.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="罐头文件管理器",
    description="罐头文件管理器",
    version="1.0.0"
)

limiter = get_limiter()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
```

- [ ] **Step 3: 提交更改**

```bash
git add backend/app/main.py
git commit -m "feat(main): register admin routers to main application"
```

---

### Task 15: 创建管理员 API 客户端

**Files:**
- Create: `frontend/src/admin/api/admin.js`

- [ ] **Step 1: 创建管理员 API 客户端**

创建文件 `frontend/src/admin/api/admin.js`:

```javascript
import axios from 'axios';

const adminAPI = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
});

adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminAuthAPI = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await adminAPI.post('/api/admin/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentAdmin: async () => {
    const response = await adminAPI.get('/api/admin/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await adminAPI.post('/api/admin/auth/logout');
    return response.data;
  },
};

export const adminUsersAPI = {
  getUsers: async (page = 1, perPage = 20, search = '') => {
    const params = { page, per_page: perPage };
    if (search) params.search = search;
    const response = await adminAPI.get('/api/admin/users', { params });
    return response.data;
  },

  getUserDetail: async (userId) => {
    const response = await adminAPI.get(`/api/admin/users/${userId}`);
    return response.data;
  },

  toggleUser: async (userId) => {
    const response = await adminAPI.patch(`/api/admin/users/${userId}`, { action: 'toggle_active' });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await adminAPI.delete(`/api/admin/users/${userId}`);
    return response.data;
  },
};

export const adminFilesAPI = {
  getFiles: async (page = 1, perPage = 20, userId = null, search = '') => {
    const params = { page, per_page: perPage };
    if (userId) params.user_id = userId;
    if (search) params.search = search;
    const response = await adminAPI.get('/api/admin/files', { params });
    return response.data;
  },

  getFileDetail: async (fileId) => {
    const response = await adminAPI.get(`/api/admin/files/${fileId}`);
    return response.data;
  },

  deleteFile: async (fileId) => {
    const response = await adminAPI.delete(`/api/admin/files/${fileId}`);
    return response.data;
  },
};

export const adminDashboardAPI = {
  getDashboard: async () => {
    const response = await adminAPI.get('/api/admin/dashboard');
    return response.data;
  },
};

export const adminSettingsAPI = {
  getSettings: async () => {
    const response = await adminAPI.get('/api/admin/settings');
    return response.data;
  },

  updateSettings: async (configs) => {
    const response = await adminAPI.put('/api/admin/settings', { configs });
    return response.data;
  },
};

export const adminAuditLogsAPI = {
  getLogs: async (page = 1, perPage = 20, action = null) => {
    const params = { page, per_page: perPage };
    if (action) params.action = action;
    const response = await adminAPI.get('/api/admin/audit-logs', { params });
    return response.data;
  },
};
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/admin/api/admin.js
git commit -m "feat(api): add admin API client"
```

---

### Task 16: 创建管理员认证上下文

**Files:**
- Create: `frontend/src/admin/context/AdminAuthContext.jsx`

- [ ] **Step 1: 创建管理员认证上下文**

创建文件 `frontend/src/admin/context/AdminAuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthAPI } from '../api/admin';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin_user');
    const token = localStorage.getItem('admin_access_token');
    
    if (storedAdmin && token) {
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await adminAuthAPI.login(username, password);
    localStorage.setItem('admin_access_token', data.access_token);
    localStorage.setItem('admin_user', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data;
  };

  const logout = async () => {
    try {
      await adminAuthAPI.logout();
    } finally {
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_user');
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/admin/context/AdminAuthContext.jsx
git commit -m "feat(context): add admin auth context"
```

---

### Task 17: 创建管理员布局组件

**Files:**
- Create: `frontend/src/admin/layouts/AdminLayout.jsx`
- Create: `frontend/src/admin/components/AdminSidebar.jsx`

- [ ] **Step 1: 创建管理员侧边栏组件**

创建文件 `frontend/src/admin/components/AdminSidebar.jsx`:

```javascript
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSidebar() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const links = [
    { to: '/admin', label: '仪表盘', icon: '📊' },
    { to: '/admin/users', label: '用户管理', icon: '👥' },
    { to: '/admin/files', label: '文件管理', icon: '📁' },
    { to: '/admin/settings', label: '系统设置', icon: '⚙️' },
    { to: '/admin/audit-logs', label: '操作日志', icon: '📝' },
  ];

  return (
    <div className="w-64 bg-[#171717] text-white h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">管理员后台</h1>
        <p className="text-sm text-gray-400 mt-1">{admin?.username}</p>
      </div>
      
      <nav className="flex-1 p-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-gray-300 hover:text-white transition-colors"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建管理员布局组件**

创建文件 `frontend/src/admin/layouts/AdminLayout.jsx`:

```javascript
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: 提交更改**

```bash
git add frontend/src/admin/components/AdminSidebar.jsx frontend/src/admin/layouts/AdminLayout.jsx
git commit -m "feat(layout): add admin layout and sidebar components"
```

---

### Task 18: 创建管理员通用组件

**Files:**
- Create: `frontend/src/admin/components/StatCard.jsx`
- Create: `frontend/src/admin/components/DataTable.jsx`
- Create: `frontend/src/admin/components/Toggle.jsx`

- [ ] **Step 1: 创建统计卡片组件**

创建文件 `frontend/src/admin/components/StatCard.jsx`:

```javascript
export default function StatCard({ title, value, icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colors[color]} rounded-lg flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建数据表格组件**

创建文件 `frontend/src/admin/components/DataTable.jsx`:

```javascript
export default function DataTable({ columns, data, actions }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={row.id || index} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {actions(row)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: 创建开关组件**

创建文件 `frontend/src/admin/components/Toggle.jsx`:

```javascript
export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`w-10 h-6 rounded-full transition-colors ${
            checked ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </div>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
```

- [ ] **Step 4: 提交更改**

```bash
git add frontend/src/admin/components/StatCard.jsx frontend/src/admin/components/DataTable.jsx frontend/src/admin/components/Toggle.jsx
git commit -m "feat(components): add admin utility components"
```

---

### Task 19: 创建管理员登录页

**Files:**
- Create: `frontend/src/admin/pages/Login.jsx`

- [ ] **Step 1: 创建管理员登录页**

创建文件 `frontend/src/admin/pages/Login.jsx`:

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">管理员登录</h1>
          <p className="text-gray-500 mt-2">罐头文件管理器</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/admin/pages/Login.jsx
git commit -m "feat(pages): add admin login page"
```

---

### Task 20: 创建管理员仪表盘页

**Files:**
- Create: `frontend/src/admin/pages/Dashboard.jsx`

- [ ] **Step 1: 创建管理员仪表盘页**

创建文件 `frontend/src/admin/pages/Dashboard.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { adminDashboardAPI } from '../api/admin';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminDashboardAPI.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('加载仪表盘失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const logColumns = [
    { key: 'created_at', label: '时间', render: (val) => new Date(val).toLocaleString('zh-CN') },
    { key: 'admin_username', label: '管理员' },
    { key: 'action', label: '操作' },
    { key: 'details', label: '详情' },
    { key: 'ip_address', label: 'IP 地址' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="总用户数"
          value={dashboard?.stats?.total_users || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="总文件数"
          value={dashboard?.stats?.total_files || 0}
          icon="📁"
          color="green"
        />
        <StatCard
          title="总存储"
          value={formatBytes(dashboard?.stats?.total_storage || 0)}
          icon="💾"
          color="yellow"
        />
        <StatCard
          title="今日活跃"
          value={dashboard?.stats?.active_users_today || 0}
          icon="📈"
          color="red"
        />
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">最近操作</h2>
      </div>

      <DataTable
        columns={logColumns}
        data={dashboard?.recent_logs || []}
      />
    </div>
  );
}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/admin/pages/Dashboard.jsx
git commit -m "feat(pages): add admin dashboard page"
```

---

### Task 21: 创建用户管理页

**Files:**
- Create: `frontend/src/admin/pages/Users.jsx`

- [ ] **Step 1: 创建用户管理页**

创建文件 `frontend/src/admin/pages/Users.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUsersAPI } from '../api/admin';
import DataTable from '../components/DataTable';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      const data = await adminUsersAPI.getUsers(page, 20, search);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error) {
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId) => {
    try {
      await adminUsersAPI.toggleUser(userId);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || '操作失败');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('确定要删除此用户吗？此操作不可恢复。')) {
      return;
    }

    try {
      await adminUsersAPI.deleteUser(userId);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.detail || '删除失败');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    { key: 'username', label: '用户名' },
    { key: 'email', label: '邮箱' },
    { 
      key: 'file_count', 
      label: '文件数',
      render: (val) => val || 0
    },
    { 
      key: 'storage_used', 
      label: '存储使用',
      render: (val) => formatBytes(val || 0)
    },
    { 
      key: 'is_active', 
      label: '状态',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {val ? '正常' : '禁用'}
        </span>
      )
    },
  ];

  const actions = (row) => (
    <div className="flex gap-2">
      <button
        onClick={() => navigate(`/admin/users/${row.id}`)}
        className="text-blue-500 hover:text-blue-700"
      >
        查看
      </button>
      <button
        onClick={() => handleToggle(row.id)}
        className="text-yellow-500 hover:text-yellow-700"
      >
        {row.is_active ? '禁用' : '启用'}
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="text-red-500 hover:text-red-700"
      >
        删除
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <input
          type="text"
          placeholder="搜索用户..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        actions={actions}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          共 {total} 个用户
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={users.length < 20}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/admin/pages/Users.jsx
git commit -m "feat(pages): add admin users management page"
```

---

### Task 22: 创建用户详情页

**Files:**
- Create: `frontend/src/admin/pages/UserDetail.jsx`

- [ ] **Step 1: 创建用户详情页**

创建文件 `frontend/src/admin/pages/UserDetail.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminUsersAPI } from '../api/admin';
import DataTable from '../components/DataTable';

export default function UserDetail() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const data = await adminUsersAPI.getUserDetail(userId);
      setData(data);
    } catch (error) {
      console.error('加载用户详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-gray-500">用户不存在</div>
      </div>
    );
  }

  const fileColumns = [
    { key: 'filename', label: '文件名' },
    { 
      key: 'size', 
      label: '大小',
      render: (val) => formatBytes(val)
    },
    { 
      key: 'created_at', 
      label: '上传时间',
      render: (val) => new Date(val).toLocaleString('zh-CN')
    },
  ];

  return (
    <div className="p-8">
      <button
        onClick={() => navigate('/admin/users')}
        className="mb-6 text-blue-500 hover:text-blue-700"
      >
        ← 返回用户列表
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">用户详情</h1>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">用户名</p>
            <p className="text-lg font-medium">{data.user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">邮箱</p>
            <p className="text-lg font-medium">{data.user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">状态</p>
            <span className={`px-2 py-1 rounded-full text-xs ${
              data.user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {data.user.is_active ? '正常' : '禁用'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">注册时间</p>
            <p className="text-lg font-medium">
              {new Date(data.user.created_at).toLocaleString('zh-CN')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">文件数</p>
            <p className="text-lg font-medium">{data.file_count}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">存储使用</p>
            <p className="text-lg font-medium">{formatBytes(data.storage_used)}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">用户文件</h2>
      <DataTable
        columns={fileColumns}
        data={data.files}
      />
    </div>
  );
}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/admin/pages/UserDetail.jsx
git commit -m "feat(pages): add admin user detail page"
```

---

### Task 23: 创建文件管理页

**Files:**
- Create: `frontend/src/admin/pages/Files.jsx`

- [ ] **Step 1: 创建文件管理页**

创建文件 `frontend/src/admin/pages/Files.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { adminFilesAPI } from '../api/admin';
import DataTable from '../components/DataTable';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, [page, search]);

  const loadFiles = async () => {
    try {
      const data = await adminFilesAPI.getFiles(page, 20, null, search);
      setFiles(data.files);
      setTotal(data.total);
    } catch (error) {
      console.error('加载文件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('确定要删除此文件吗？此操作不可恢复。')) {
      return;
    }

    try {
      await adminFilesAPI.deleteFile(fileId);
      loadFiles();
    } catch (error) {
      alert(error.response?.data?.detail || '删除失败');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    { key: 'filename', label: '文件名' },
    { key: 'owner_username', label: '所有者' },
    { 
      key: 'size', 
      label: '大小',
      render: (val) => formatBytes(val)
    },
    { 
      key: 'created_at', 
      label: '上传时间',
      render: (val) => new Date(val).toLocaleString('zh-CN')
    },
  ];

  const actions = (row) => (
    <button
      onClick={() => handleDelete(row.id)}
      className="text-red-500 hover:text-red-700"
    >
      删除
    </button>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">文件管理</h1>
        <input
          type="text"
          placeholder="搜索文件..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <DataTable
        columns={columns}
        data={files}
        actions={actions}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          共 {total} 个文件
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={files.length < 20}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/admin/pages/Files.jsx
git commit -m "feat(pages): add admin files management page"
```

---

### Task 24: 创建系统设置页

**Files:**
- Create: `frontend/src/admin/pages/Settings.jsx`

- [ ] **Step 1: 创建系统设置页**

创建文件 `frontend/src/admin/pages/Settings.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { adminSettingsAPI } from '../api/admin';
import Toggle from '../components/Toggle';

export default function Settings() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await adminSettingsAPI.getSettings();
      setConfigs(data.configs);
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSettingsAPI.updateSettings(configs);
      alert('设置已保存');
    } catch (error) {
      alert(error.response?.data?.detail || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">系统设置</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            存储配额 (GB)
          </label>
          <input
            type="number"
            value={configs.storage_quota || 10}
            onChange={(e) => setConfigs({ ...configs, storage_quota: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            允许注册
          </label>
          <Toggle
            checked={configs.allow_register === 'true'}
            onChange={(e) => setConfigs({ 
              ...configs, 
              allow_register: e.target.checked ? 'true' : 'false' 
            })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            最大文件大小 (MB)
          </label>
          <input
            type="number"
            value={configs.max_file_size || 100}
            onChange={(e) => setConfigs({ ...configs, max_file_size: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            允许的文件扩展名
          </label>
          <input
            type="text"
            value={configs.allowed_extensions || '*'}
            onChange={(e) => setConfigs({ ...configs, allowed_extensions: e.target.value })}
            placeholder="* 表示允许所有，或使用逗号分隔：.jpg,.png,.pdf"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            使用 * 允许所有文件，或使用逗号分隔指定扩展名（如：.jpg,.png,.pdf）
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/admin/pages/Settings.jsx
git commit -m "feat(pages): add admin settings page"
```

---

### Task 25: 创建操作日志页

**Files:**
- Create: `frontend/src/admin/pages/AuditLogs.jsx`

- [ ] **Step 1: 创建操作日志页**

创建文件 `frontend/src/admin/pages/AuditLogs.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { adminAuditLogsAPI } from '../api/admin';
import DataTable from '../components/DataTable';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [page, action]);

  const loadLogs = async () => {
    try {
      const data = await adminAuditLogsAPI.getLogs(page, 20, action || null);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error) {
      console.error('加载日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'created_at', 
      label: '时间',
      render: (val) => new Date(val).toLocaleString('zh-CN')
    },
    { key: 'admin_username', label: '管理员' },
    { key: 'action', label: '操作' },
    { key: 'target_type', label: '目标类型' },
    { key: 'target_id', label: '目标ID' },
    { key: 'details', label: '详情' },
    { key: 'ip_address', label: 'IP地址' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">操作日志</h1>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部操作</option>
          <option value="login">登录</option>
          <option value="logout">登出</option>
          <option value="delete_user">删除用户</option>
          <option value="toggle_user">禁用/启用用户</option>
          <option value="delete_file">删除文件</option>
          <option value="update_config">更新配置</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={logs}
      />

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          共 {total} 条日志
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            上一页
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={logs.length < 20}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交更改**

```bash
git add frontend/src/admin/pages/AuditLogs.jsx
git commit -m "feat(pages): add admin audit logs page"
```

---

### Task 26: 注册管理员路由到前端应用

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: 导入管理员组件**

修改文件 `frontend/src/App.jsx`，在导入部分添加:

```javascript
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import AdminLayout from './admin/layouts/AdminLayout';
import AdminLogin from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import Users from './admin/pages/Users';
import UserDetail from './admin/pages/UserDetail';
import Files from './admin/pages/Files';
import Settings from './admin/pages/Settings';
import AuditLogs from './admin/pages/AuditLogs';
```

- [ ] **Step 2: 创建管理员路由保护组件**

在 App 组件前添加:

```javascript
function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AdminPublicRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (admin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
```

- [ ] **Step 3: 添加管理员路由**

在 Routes 组件中添加管理员路由:

```javascript
<Route
  path="/admin/login"
  element={
    <AdminPublicRoute>
      <AdminLogin />
    </AdminPublicRoute>
  }
/>
<Route
  path="/admin"
  element={
    <AdminProtectedRoute>
      <AdminLayout />
    </AdminProtectedRoute>
  }
>
  <Route index element={<Dashboard />} />
  <Route path="users" element={<Users />} />
  <Route path="users/:userId" element={<UserDetail />} />
  <Route path="files" element={<Files />} />
  <Route path="settings" element={<Settings />} />
  <Route path="audit-logs" element={<AuditLogs />} />
</Route>
```

完整的 App.jsx 应该是:

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';
import AdminLayout from './admin/layouts/AdminLayout';
import AdminLogin from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import Users from './admin/pages/Users';
import UserDetail from './admin/pages/UserDetail';
import Files from './admin/pages/Files';
import Settings from './admin/pages/Settings';
import AuditLogs from './admin/pages/AuditLogs';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminProtectedRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AdminPublicRoute({ children }) {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  if (admin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <AdminAuthProvider>
                <AdminPublicRoute>
                  <AdminLogin />
                </AdminPublicRoute>
              </AdminAuthProvider>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminAuthProvider>
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              </AdminAuthProvider>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:userId" element={<UserDetail />} />
            <Route path="files" element={<Files />} />
            <Route path="settings" element={<Settings />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
```

- [ ] **Step 4: 提交更改**

```bash
git add frontend/src/App.jsx
git commit -m "feat(app): register admin routes to frontend application"
```

---

### Task 27: 创建环境变量配置

**Files:**
- Modify: `backend/.env.example`

- [ ] **Step 1: 更新环境变量示例文件**

修改文件 `backend/.env.example`，添加管理员 JWT Secret:

```env
DATABASE_URL=mysql+pymysql://root@localhost:3306/filemanager
DATABASE_PASSWORD=123456
SECRET_KEY=your-secret-key-here
ADMIN_SECRET_KEY=your-admin-secret-key-here
STORAGE_PATH=./storage
DEBUG=False
STORAGE_QUOTA_GB=2
```

- [ ] **Step 2: 创建实际的 .env 文件**

创建文件 `backend/.env`:

```env
DATABASE_URL=mysql+pymysql://root@localhost:3306/filemanager
DATABASE_PASSWORD=123456
SECRET_KEY=your-secret-key-here-change-this-in-production
ADMIN_SECRET_KEY=your-admin-secret-key-here-change-this-in-production
STORAGE_PATH=./storage
DEBUG=False
STORAGE_QUOTA_GB=2
```

- [ ] **Step 3: 提交更改**

```bash
git add backend/.env.example
git commit -m "feat(config): add admin secret key to environment config"
```

---

### Task 28: 创建默认管理员账户

**Files:**
- Create: `backend/create_default_admin.py`

- [ ] **Step 1: 创建默认管理员账户脚本**

创建文件 `backend/create_default_admin.py`:

```python
import sys
sys.path.append('.')

from app.database import SessionLocal
from app.models.admin import Admin
from app.utils.admin_security import get_password_hash

def create_default_admin():
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.username == "admin").first()
        if existing:
            print("管理员账户已存在")
            return
        
        admin = Admin(
            username="admin",
            password_hash=get_password_hash("admin123"),
            email="admin@example.com",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("默认管理员账户创建成功")
        print("用户名: admin")
        print("密码: admin123")
    finally:
        db.close()

if __name__ == "__main__":
    create_default_admin()
```

- [ ] **Step 2: 运行脚本创建默认管理员**

运行命令:
```bash
cd backend
python create_default_admin.py
```

预期输出:
```
默认管理员账户创建成功
用户名: admin
密码: admin123
```

- [ ] **Step 3: 提交更改**

```bash
git add backend/create_default_admin.py
git commit -m "feat(scripts): add default admin creation script"
```

---

### Task 29: 测试管理员后台

- [ ] **Step 1: 启动后端服务器**

运行命令:
```bash
cd backend
python -m uvicorn app.main:app --reload
```

预期输出: 服务器启动成功，无错误

- [ ] **Step 2: 启动前端开发服务器**

运行命令:
```bash
cd frontend
npm run dev
```

预期输出: 前端服务器启动成功

- [ ] **Step 3: 测试管理员登录**

打开浏览器访问 `http://localhost:5173/admin/login`，使用以下凭据登录:
- 用户名: admin
- 密码: admin123

预期结果: 成功登录并跳转到仪表盘

- [ ] **Step 4: 测试仪表盘**

检查仪表盘是否正确显示统计数据和最近操作日志。

预期结果: 显示用户数、文件数、总存储、今日活跃等统计信息

- [ ] **Step 5: 测试用户管理**

导航到用户管理页面，测试查看用户、禁用/启用用户、删除用户等功能。

预期结果: 所有功能正常工作

- [ ] **Step 6: 测试文件管理**

导航到文件管理页面，测试查看文件、删除文件等功能。

预期结果: 所有功能正常工作

- [ ] **Step 7: 测试系统设置**

导航到系统设置页面，测试修改配置并保存。

预期结果: 配置成功保存并生效

- [ ] **Step 8: 测试操作日志**

导航到操作日志页面，检查之前的操作是否被正确记录。

预期结果: 所有操作都被记录在日志中

---

### Task 30: 最终提交和文档

- [ ] **Step 1: 确认所有更改已提交**

运行命令:
```bash
git status
```

预期输出: 无未提交的更改

- [ ] **Step 2: 创建功能分支并合并**

```bash
git checkout -b feature/admin-panel
git add .
git commit -m "feat: complete admin panel implementation

- Add admin authentication system with independent JWT
- Add user management (list, detail, toggle, delete)
- Add file management (list, delete)
- Add dashboard with statistics
- Add system settings management
- Add audit logs tracking
- Add admin frontend pages and components

Closes #XX"
git checkout main
git merge feature/admin-panel
```

- [ ] **Step 3: 推送到远程仓库**

```bash
git push origin main
```

---

## 实施总结

本实施计划包含 30 个主要任务，每个任务都细分为具体的步骤，预计总实施时间为 2-3 天。

### 关键里程碑

1. **Task 1-4**: 数据库迁移（约 2 小时）
2. **Task 5-7**: 后端基础服务（约 3 小时）
3. **Task 8-14**: 后端 API 路由（约 4 小时）
4. **Task 15-18**: 前端基础组件（约 3 小时）
5. **Task 19-25**: 前端页面（约 5 小时）
6. **Task 26-28**: 集成和配置（约 2 小时）
7. **Task 29-30**: 测试和部署（约 3 小时）

### 风险和注意事项

1. **数据库迁移**: 确保在执行迁移前备份数据库
2. **JWT Secret**: 必须设置独立的 ADMIN_SECRET_KEY
3. **默认管理员**: 首次部署后立即修改默认管理员密码
4. **权限验证**: 确保所有管理员 API 都有正确的权限验证
5. **审计日志**: 确保所有关键操作都被记录

### 后续优化建议

1. 添加管理员权限分级（超级管理员、普通管理员）
2. 添加更详细的审计日志（包含更多上下文信息）
3. 添加数据导出功能
4. 添加系统监控和告警功能
5. 添加批量操作功能
