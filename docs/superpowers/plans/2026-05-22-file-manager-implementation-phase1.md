# 文件管理器 - 第一阶段实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建基础项目结构，包括项目初始化、数据库连接、用户认证API、前端基础界面

**Architecture:** 前后端分离架构，后端使用FastAPI提供REST API，前端使用React+Vite，数据库使用MySQL，用户认证采用JWT Token

**Tech Stack:** Python 3.10+, FastAPI, SQLAlchemy, MySQL, React 18, Vite, Tailwind CSS, Axios, PyJWT, bcrypt

---

## 项目结构概览

```
d:/text/file transfer station/
├── backend/                          # 后端项目
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # 应用入口
│   │   ├── config.py                # 配置文件
│   │   ├── database.py              # 数据库连接
│   │   ├── models/                  # 数据库模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── file.py
│   │   ├── schemas/                 # Pydantic模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   └── file.py
│   │   ├── routers/                 # 路由
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   └── files.py
│   │   ├── services/                # 业务逻辑
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   └── file.py
│   │   └── utils/                    # 工具函数
│   │       ├── __init__.py
│   │       ├── security.py
│   │       └── file.py
│   ├── tests/                        # 测试
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   └── test_files.py
│   ├── storage/                      # 文件存储目录
│   ├── requirements.txt
│   └── README.md
└── frontend/                         # 前端项目
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/
    │   │   ├── index.js
    │   │   ├── auth.js
    │   │   └── files.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── FileList.jsx
    │   │   ├── FileItem.jsx
    │   │   ├── Breadcrumb.jsx
    │   │   ├── UploadModal.jsx
    │   │   ├── CreateFolderModal.jsx
    │   │   └── ContextMenu.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Home.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   └── styles/
    │       └── index.css
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 任务列表

### 阶段一：后端基础

#### Task 1: 后端项目初始化

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/config.py`

- [ ] **Step 1: 创建 requirements.txt**

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pymysql==1.1.0
cryptography==41.0.7
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic==2.5.2
pydantic-settings==2.1.0
aiofiles==23.2.1
```

- [ ] **Step 2: 创建 config.py**

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/filemanager"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    
    # File Storage
    STORAGE_PATH: str = "./storage"
    MAX_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_EXTENSIONS: List[str] = [
        '.txt', '.pdf', '.doc', '.docx', 
        '.jpg', '.jpeg', '.png', '.gif',
        '.mp4', '.mp3', '.zip', '.rar'
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

- [ ] **Step 3: 创建 main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine
from app.models import user, file

# Create tables
user.Base.metadata.create_all(bind=engine)
file.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CloudFileManager API",
    description="私有云盘文件管理器API",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "CloudFileManager API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

- [ ] **Step 4: 提交代码**

```bash
cd "d:/text/file transfer station"
git add backend/requirements.txt backend/app/__init__.py backend/app/main.py backend/app/config.py
git commit -m "feat: 初始化后端项目结构"
```

---

#### Task 2: 数据库连接和模型

**Files:**
- Create: `backend/app/database.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/file.py`

- [ ] **Step 1: 创建 database.py**

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=True  # 开发环境显示SQL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """数据库会话依赖"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 2: 创建 user.py 模型**

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    files = relationship("File", back_populates="owner", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User {self.username}>"
```

- [ ] **Step 3: 创建 file.py 模型**

```python
from sqlalchemy import Column, Integer, String, Boolean, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    path = Column(String(1000), nullable=False)
    is_folder = Column(Boolean, default=False)
    size = Column(BigInteger, default=0)
    parent_id = Column(Integer, ForeignKey("files.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="files")
    parent = relationship("File", remote_side=[id], backref="children")
    
    def __repr__(self):
        return f"<File {self.name}>"
```

- [ ] **Step 4: 更新 models/__init__.py**

```python
from app.models.user import User
from app.models.file import File

__all__ = ["User", "File"]
```

- [ ] **Step 5: 提交代码**

```bash
git add backend/app/database.py backend/app/models/
git commit -m "feat: 添加数据库连接和模型"
```

---

#### Task 3: Pydantic Schemas

**Files:**
- Create: `backend/app/schemas/__init__.py`
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/schemas/file.py`

- [ ] **Step 1: 创建 user.py schema**

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
```

- [ ] **Step 2: 创建 file.py schema**

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FileBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    parent_id: Optional[int] = None

class FileCreate(FileBase):
    pass

class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    parent_id: Optional[int] = None

class FileResponse(FileBase):
    id: int
    user_id: int
    is_folder: bool
    size: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FileListResponse(BaseModel):
    files: List[FileResponse]

class FileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    parent_id: Optional[int] = None

class MessageResponse(BaseModel):
    message: str
```

- [ ] **Step 3: 更新 schemas/__init__.py**

```python
from app.schemas.user import (
    UserBase, UserCreate, UserLogin, 
    UserResponse, Token, TokenData, AuthResponse
)
from app.schemas.file import (
    FileBase, FileCreate, FolderCreate, FileResponse,
    FileListResponse, FileUpdate, MessageResponse
)

__all__ = [
    "UserBase", "UserCreate", "UserLogin", "UserResponse", 
    "Token", "TokenData", "AuthResponse",
    "FileBase", "FileCreate", "FolderCreate", "FileResponse",
    "FileListResponse", "FileUpdate", "MessageResponse"
]
```

- [ ] **Step 4: 提交代码**

```bash
git add backend/app/schemas/
git commit -m "feat: 添加Pydantic schemas"
```

---

#### Task 4: 安全工具函数

**Files:**
- Create: `backend/app/utils/__init__.py`
- Create: `backend/app/utils/security.py`
- Create: `backend/app/utils/file.py`

- [ ] **Step 1: 创建 security.py**

```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """哈希密码"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建JWT Token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    """解码JWT Token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """获取当前用户"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="请先登录",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    payload = decode_token(token)
    
    if payload is None:
        raise credentials_exception
    
    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="用户已被禁用"
        )
    
    return user
```

- [ ] **Step 2: 创建 file.py 工具**

```python
import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from app.config import settings

def get_user_storage_path(user_id: int) -> Path:
    """获取用户的存储路径"""
    storage_path = Path(settings.STORAGE_PATH) / "users" / str(user_id) / "files"
    storage_path.mkdir(parents=True, exist_ok=True)
    return storage_path

def generate_unique_filename(original_filename: str) -> str:
    """生成唯一的文件名"""
    ext = Path(original_filename).suffix
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return unique_name

def get_file_extension(filename: str) -> str:
    """获取文件扩展名"""
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str) -> bool:
    """检查文件类型是否允许"""
    ext = get_file_extension(filename)
    return ext in settings.ALLOWED_EXTENSIONS

def get_file_path(user_id: int, db_path: str) -> Path:
    """根据数据库路径获取物理文件路径"""
    base_path = get_user_storage_path(user_id)
    return base_path / db_path

def validate_filename(filename: str) -> bool:
    """验证文件名（防止路径遍历）"""
    dangerous_chars = ['..', '/', '\\', '\0']
    return not any(char in filename for char in dangerous_chars)

async def save_upload_file(upload_file: UploadFile, user_id: int) -> tuple[str, int]:
    """保存上传的文件，返回(db_path, file_size)"""
    if not upload_file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件名不能为空"
        )
    
    if not validate_filename(upload_file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="文件名包含非法字符"
        )
    
    if not is_allowed_file(upload_file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型，仅支持: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    storage_path = get_user_storage_path(user_id)
    unique_filename = generate_unique_filename(upload_file.filename)
    file_path = storage_path / unique_filename
    
    file_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await upload_file.read(8192):
            file_size += len(chunk)
            if file_size > settings.MAX_FILE_SIZE:
                buffer.close()
                os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"文件大小超过限制 ({settings.MAX_FILE_SIZE // (1024*1024)}MB)"
                )
            buffer.write(chunk)
    
    return unique_filename, file_size

def delete_physical_file(file_path: str, user_id: int) -> None:
    """删除物理文件"""
    full_path = get_file_path(user_id, file_path)
    if full_path.exists():
        os.remove(full_path)
```

- [ ] **Step 3: 更新 utils/__init__.py**

```python
from app.utils.security import (
    verify_password, get_password_hash,
    create_access_token, decode_token, get_current_user
)
from app.utils.file import (
    get_user_storage_path, generate_unique_filename,
    get_file_extension, is_allowed_file, get_file_path,
    validate_filename, save_upload_file, delete_physical_file
)

__all__ = [
    "verify_password", "get_password_hash",
    "create_access_token", "decode_token", "get_current_user",
    "get_user_storage_path", "generate_unique_filename",
    "get_file_extension", "is_allowed_file", "get_file_path",
    "validate_filename", "save_upload_file", "delete_physical_file"
]
```

- [ ] **Step 4: 提交代码**

```bash
git add backend/app/utils/
git commit -m "feat: 添加安全工具和文件工具"
```

---

#### Task 5: 认证服务

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/auth.py`

- [ ] **Step 1: 创建 auth.py 服务**

```python
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.utils.security import verify_password, get_password_hash, create_access_token

class AuthService:
    """认证服务"""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """创建新用户"""
        # 检查用户名是否存在
        existing_user = db.query(User).filter(User.username == user_data.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="用户名已存在"
            )
        
        # 检查邮箱是否存在
        if user_data.email:
            existing_email = db.query(User).filter(User.email == user_data.email).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="邮箱已被注册"
                )
        
        # 创建用户
        hashed_password = get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        """验证用户登录"""
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        return user
    
    @staticmethod
    def create_token(user: User) -> str:
        """为用户创建访问令牌"""
        access_token = create_access_token(
            data={"sub": user.id, "username": user.username}
        )
        return access_token
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()
```

- [ ] **Step 2: 更新 services/__init__.py**

```python
from app.services.auth import AuthService

__all__ = ["AuthService"]
```

- [ ] **Step 3: 提交代码**

```bash
git add backend/app/services/
git commit -m "feat: 添加认证服务"
```

---

#### Task 6: 认证路由

**Files:**
- Create: `backend/app/routers/__init__.py`
- Create: `backend/app/routers/auth.py`

- [ ] **Step 1: 创建 auth.py 路由**

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, AuthResponse, Token
from app.services.auth import AuthService

router = APIRouter(prefix="/api/auth", tags=["认证"])

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    用户注册
    """
    user = AuthService.create_user(db, user_data)
    token = AuthService.create_token(user)
    
    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=AuthResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    用户登录
    """
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = AuthService.create_token(user)
    
    return AuthResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    获取当前用户信息
    """
    return UserResponse.model_validate(current_user)

@router.post("/logout")
async def logout():
    """
    用户登出（前端清除Token即可）
    """
    return {"message": "登出成功"}
```

- [ ] **Step 2: 更新 main.py 引入路由**

在 `backend/app/main.py` 中添加：

```python
from app.routers import auth, files

# 注册路由
app.include_router(auth.router)
app.include_router(files.router)
```

- [ ] **Step 3: 提交代码**

```bash
git add backend/app/routers/
git add backend/app/main.py
git commit -m "feat: 添加认证路由"
```

---

### 阶段二：前端基础

#### Task 7: 前端项目初始化

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "cloudfile-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

- [ ] **Step 3: 创建 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
```

- [ ] **Step 4: 创建 postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CloudFile - 文件管理器</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 6: 创建 src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 7: 创建 src/styles/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- [ ] **Step 8: 提交代码**

```bash
git add frontend/
git commit -m "feat: 初始化前端项目"
```

---

#### Task 8: API 客户端

**Files:**
- Create: `frontend/src/api/index.js`
- Create: `frontend/src/api/auth.js`

- [ ] **Step 1: 创建 API 配置**

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// 请求拦截器：添加Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
```

- [ ] **Step 2: 创建 auth API**

```javascript
import api from './index';

export const authAPI = {
  register: async (username, password, email) => {
    const response = await api.post('/api/auth/register', {
      username,
      password,
      email,
    });
    return response.data;
  },

  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
};
```

- [ ] **Step 3: 提交代码**

```bash
git add frontend/src/api/
git commit -m "feat: 添加API客户端"
```

---

#### Task 9: 认证上下文和Hooks

**Files:**
- Create: `frontend/src/context/AuthContext.jsx`
- Create: `frontend/src/hooks/useAuth.js`

- [ ] **Step 1: 创建 AuthContext**

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authAPI.login(username, password);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (username, password, email) => {
    const data = await authAPI.register(username, password, email);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: 创建 useAuth hook**

```javascript
import { useAuth } from '../context/AuthContext';

export function useAuth() {
  return useAuth();
}
```

- [ ] **Step 3: 提交代码**

```bash
git add frontend/src/context/ frontend/src/hooks/
git commit -m "feat: 添加认证上下文和Hook"
```

---

#### Task 10: 登录注册页面

**Files:**
- Create: `frontend/src/pages/Login.jsx`
- Create: `frontend/src/pages/Register.jsx`

- [ ] **Step 1: 创建 Login 页面**

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">登录 CloudFile</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="text-center mt-4">
          还没有账号？{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 Register 页面**

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      await register(username, password, email);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">注册 CloudFile</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              minLength={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              minLength={6}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="text-center mt-4">
          已有账号？{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 提交代码**

```bash
git add frontend/src/pages/Login.jsx frontend/src/pages/Register.jsx
git commit -m "feat: 添加登录和注册页面"
```

---

#### Task 11: 主界面基础布局

**Files:**
- Create: `frontend/src/App.jsx`
- Create: `frontend/src/components/Navbar.jsx`
- Create: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: 创建 App.jsx**

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

- [ ] **Step 2: 创建 Navbar 组件**

```jsx
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar({ onUploadClick }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600">☁️ CloudFile</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onUploadClick}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              上传
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <span className="mr-2">{user?.username}</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: 创建 Home 页面（基础版本）**

```jsx
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Home() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/files?parent_id=null');
      setFiles(response.data.files);
      setError('');
    } catch (err) {
      setError('加载文件列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar onUploadClick={() => alert('上传功能待实现')} />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-lg font-medium">欢迎使用 CloudFile</h1>
              <p className="mt-1 text-sm text-gray-600">
                当前用户: {user?.username}
              </p>
              
              {loading ? (
                <p className="mt-4">加载中...</p>
              ) : error ? (
                <p className="mt-4 text-red-600">{error}</p>
              ) : files.length === 0 ? (
                <p className="mt-4 text-gray-500">暂无文件，上传一些文件开始吧！</p>
              ) : (
                <p className="mt-4">文件数量: {files.length}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 4: 提交代码**

```bash
git add frontend/src/App.jsx frontend/src/components/Navbar.jsx frontend/src/pages/Home.jsx
git commit -m "feat: 添加主界面基础布局"
```

---

## 实现顺序

1. **Task 1-6**: 后端基础（项目初始化 → 数据库 → schemas → 工具 → 服务 → 路由）
2. **Task 7-11**: 前端基础（项目初始化 → API → 上下文 → 登录注册 → 主界面）

---

## 自检清单

- [ ] 所有代码块包含完整实现
- [ ] 文件路径使用绝对路径
- [ ] 每个任务有具体的测试步骤
- [ ] 没有占位符或TODO
- [ ] 类型一致性检查通过

---

## 下一步

完成第一阶段后，继续第二阶段：
- Task 12: 文件服务
- Task 13: 文件API路由
- Task 14: 文件列表组件
- Task 15: 上传组件
- Task 16: 文件操作菜单
