# 文件管理器 - 设计文档

**项目名称**: CloudFileManager  
**版本**: 1.0  
**日期**: 2026-05-22  
**状态**: 设计中

---

## 1. 项目概述

### 1.1 项目背景

本项目旨在开发一个部署在本地服务器的私有云盘/文件管理器系统，为个人和团队提供安全、便捷的文件存储和共享服务。

### 1.2 核心功能

- 多用户账号系统
- 文件上传/下载/预览
- 文件夹管理（创建、删除、移动）
- 文件操作（重命名、删除）
- 文件夹导航和搜索
- 用户权限管理

### 1.3 目标用户

- 个人用户：私有文件存储
- 小型团队：文件共享和协作

---

## 2. 技术架构

### 2.1 整体架构

```
┌─────────────────┐
│   用户浏览器      │
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│  React 前端      │  端口: 5173 (开发) / 80 (生产)
│  (Vite)         │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  FastAPI 后端    │  端口: 8000
│  (Python)       │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌────────┐
│ MySQL │ │ 文件存储│
│       │ │ 本地磁盘│
└───────┘ └────────┘
```

### 2.2 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React 18 + Vite | 现代响应式UI框架 |
| 前端UI | Tailwind CSS | 快速样式开发 |
| 前端HTTP | Axios | API调用 |
| 后端 | Python FastAPI | 高性能API框架 |
| 数据库 | MySQL | 关系型数据库 |
| ORM | SQLAlchemy | 数据库ORM |
| 认证 | JWT (PyJWT) | Token认证 |
| 文件存储 | 本地文件系统 | 服务器磁盘存储 |

### 2.3 数据流

1. 用户通过浏览器访问前端应用
2. 前端通过Axios调用后端REST API
3. JWT Token认证，Token存储在前端localStorage
4. 后端验证Token并处理请求
5. 文件存储在服务器指定目录，按用户ID隔离

---

## 3. 数据库设计

### 3.1 ER图

```
┌──────────────┐       ┌──────────────┐
│    users    │       │    files    │
├──────────────┤       ├──────────────┤
│ id (PK)     │──┐     │ id (PK)     │
│ username    │  │     │ user_id(FK) │←─┐
│ password_hash│  └──→ │ name        │  │
│ email       │       │ path        │  │
│ created_at  │       │ is_folder   │  │
│ is_active   │       │ size        │  │
└──────────────┘       │ parent_id   │──┘
                      │ created_at  │
                      │ updated_at  │
                      └──────────────┘
```

### 3.2 用户表（users）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希（bcrypt） |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 注册时间 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否启用 |

### 3.3 文件表（files）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | 文件ID |
| user_id | INT | FOREIGN KEY (users.id), NOT NULL | 所属用户 |
| name | VARCHAR(255) | NOT NULL | 文件/文件夹名 |
| path | VARCHAR(1000) | NOT NULL | 相对路径 |
| is_folder | BOOLEAN | DEFAULT FALSE | 是否文件夹 |
| size | BIGINT | DEFAULT 0 | 文件大小（字节） |
| parent_id | INT | FOREIGN KEY (files.id), NULL | 父文件夹ID（根目录为NULL） |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.4 索引设计

- users表：username, email（唯一索引）
- files表：user_id, parent_id, (user_id, parent_id, name)（复合索引）

---

## 4. API接口设计

### 4.1 认证模块

#### 4.1.1 用户注册

```
POST /api/auth/register
```

**请求体**：
```json
{
  "username": "张三",
  "password": "123456",
  "email": "zhangsan@example.com"
}
```

**响应（201）**：
```json
{
  "message": "注册成功",
  "user": {
    "id": 1,
    "username": "张三",
    "email": "zhangsan@example.com"
  }
}
```

#### 4.1.2 用户登录

```
POST /api/auth/login
```

**请求体**：
```json
{
  "username": "张三",
  "password": "123456"
}
```

**响应（200）**：
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "张三",
    "email": "zhangsan@example.com"
  }
}
```

#### 4.1.3 获取当前用户

```
GET /api/auth/me
Authorization: Bearer <token>
```

**响应（200）**：
```json
{
  "id": 1,
  "username": "张三",
  "email": "zhangsan@example.com",
  "created_at": "2024-01-15T10:30:00"
}
```

### 4.2 文件管理模块

#### 4.2.1 获取文件列表

```
GET /api/files?parent_id={parent_id}
Authorization: Bearer <token>
```

**参数**：
- parent_id: 文件夹ID（根目录为null或不传）

**响应（200）**：
```json
{
  "files": [
    {
      "id": 1,
      "name": "我的文档",
      "is_folder": true,
      "parent_id": null,
      "size": 0,
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    },
    {
      "id": 2,
      "name": "报告.pdf",
      "is_folder": false,
      "parent_id": null,
      "size": 2048576,
      "created_at": "2024-01-16T14:20:00",
      "updated_at": "2024-01-16T14:20:00"
    }
  ]
}
```

#### 4.2.2 创建文件夹

```
POST /api/files/folder
Authorization: Bearer <token>
```

**请求体**：
```json
{
  "name": "新建文件夹",
  "parent_id": null
}
```

**响应（201）**：
```json
{
  "id": 3,
  "name": "新建文件夹",
  "is_folder": true,
  "parent_id": null,
  "created_at": "2024-01-17T09:00:00"
}
```

#### 4.2.3 上传文件

```
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**表单字段**：
- file: 文件（二进制）
- parent_id: 上传到哪个文件夹（可选）

**响应（201）**：
```json
{
  "id": 4,
  "name": "image.png",
  "is_folder": false,
  "parent_id": 1,
  "size": 524288,
  "created_at": "2024-01-17T09:30:00"
}
```

#### 4.2.4 下载文件

```
GET /api/files/download/{file_id}
Authorization: Bearer <token>
```

**响应**：文件二进制流

#### 4.2.5 重命名/移动文件

```
PUT /api/files/{file_id}
Authorization: Bearer <token>
```

**请求体**：
```json
{
  "name": "新文件名.pdf",
  "parent_id": 2
}
```

**响应（200）**：
```json
{
  "id": 2,
  "name": "新文件名.pdf",
  "parent_id": 2,
  "updated_at": "2024-01-17T10:00:00"
}
```

#### 4.2.6 删除文件/文件夹

```
DELETE /api/files/{file_id}
Authorization: Bearer <token>
```

**响应（200）**：
```json
{
  "message": "删除成功"
}
```

**说明**：删除文件夹时，同时删除所有子文件和子文件夹

#### 4.2.7 搜索文件

```
GET /api/files/search?q={keyword}
Authorization: Bearer <token>
```

**参数**：
- q: 搜索关键词

**响应（200）**：
```json
{
  "files": [
    {
      "id": 2,
      "name": "报告.pdf",
      "path": "/报告.pdf",
      "is_folder": false,
      "size": 2048576,
      "parent_id": null
    }
  ]
}
```

---

## 5. 前端设计

### 5.1 页面结构

| 页面 | 路由 | 说明 |
|------|------|------|
| 登录页 | /login | 用户登录 |
| 注册页 | /register | 用户注册 |
| 主界面 | / | 文件管理器首页 |

### 5.2 核心组件

| 组件 | 说明 |
|------|------|
| Navbar | 顶部导航栏：Logo、搜索、上传按钮、用户菜单 |
| Sidebar | 左侧栏：快速访问文件夹 |
| FileList | 右侧：文件列表展示 |
| FileItem | 单个文件项：图标、名称、大小、操作菜单 |
| Breadcrumb | 面包屑导航 |
| UploadModal | 上传弹窗：拖拽上传、进度显示 |
| CreateFolderModal | 创建文件夹弹窗 |
| ContextMenu | 右键菜单：重命名、删除、移动 |
| Loading | 加载状态 |
| Empty | 空文件夹提示 |

### 5.3 主界面布局

```
┌─────────────────────────────────────────┐
│ ☁ CloudFile    🔍 搜索    [上传] 👤 用户▼│  ← Navbar (60px)
├─────────┬───────────────────────────────┤
│ 📁 全部文件│                               │
│ 📁 我的文档│  名称      │ 大小 │ 修改时间  │  ← Table Header
│ 📁 图片   ├──────────────────────────────│
│ 📁 视频   │ 📁 工作    │  -   │ 今天     │
│ 📁 回收站 │ 📄 报告.pdf│ 2MB  │ 昨天     │
│          │ 🖼 图片.png│ 500KB│ 3天前    │
└─────────┴─────────────────────────────────┘
         │              ↑ FileList
         │
         └──────── Sidebar (200px)
```

### 5.4 交互流程

1. **登录流程**
   - 用户输入用户名、密码
   - 前端发送登录请求
   - 后端验证并返回JWT Token
   - 前端存储Token并跳转到主界面

2. **浏览文件**
   - 点击左侧文件夹 → 显示该目录内容
   - 点击面包屑 → 返回上级目录
   - 双击文件夹 → 进入文件夹

3. **上传文件**
   - 点击上传按钮 → 弹出上传弹窗
   - 拖拽文件到弹窗或点击选择
   - 显示上传进度
   - 上传完成 → 刷新文件列表

4. **文件操作**
   - 单击文件 → 显示选中状态
   - 右键文件 → 显示操作菜单
   - 选择操作 → 执行并刷新列表

---

## 6. 文件存储结构

### 6.1 服务器目录规划

```
/storage/                          # 存储根目录（可配置）
└── users/
    └── {user_id}/
        └── files/
            ├── folder_1/
            │   ├── subfolder/
            │   └── document.pdf
            ├── image.png
            └── video.mp4
```

### 6.2 存储规则

- 每个用户在服务器有独立目录
- 按用户ID隔离，避免文件名冲突
- 保持原有文件名（数据库记录元数据）
- 同一用户同一文件夹下不允许重名

### 6.3 文件命名策略

- 数据库使用原始文件名
- 物理文件使用UUID命名，避免特殊字符问题
- 映射关系：数据库path字段 ↔ 物理文件路径

---

## 7. 安全设计

### 7.1 认证机制

- **密码存储**：使用bcrypt哈希
- **Token认证**：JWT Token
- **Token有效期**：7天
- **Token刷新**：每次请求自动延期

### 7.2 权限控制

- 用户只能访问自己的文件
- 管理员可以管理所有用户（可选）
- 文件操作需验证所有权

### 7.3 文件安全

- 路径遍历防护：禁止 `../` 等路径
- 文件类型限制：可配置允许的文件类型
- 文件大小限制：可配置单文件大小上限

### 7.4 SQL注入防护

- 使用ORM（SQLAlchemy）避免SQL注入
- 参数化查询

---

## 8. 错误处理

### 8.1 后端错误响应

| 状态码 | 场景 | 响应示例 |
|--------|------|---------|
| 400 | 参数错误 | `{"detail": "文件名不能为空"}` |
| 401 | 未登录 | `{"detail": "请先登录"}` |
| 403 | 无权限 | `{"detail": "没有权限访问此文件"}` |
| 404 | 资源不存在 | `{"detail": "文件不存在"}` |
| 409 | 冲突 | `{"detail": "文件名已存在"}` |
| 413 | 文件过大 | `{"detail": "文件大小超过限制"}` |
| 500 | 服务器错误 | `{"detail": "服务器内部错误"}` |

### 8.2 前端错误处理

| 场景 | 处理方式 |
|------|---------|
| 网络断开 | 弹出提示："网络连接失败，请检查网络" |
| 401未登录 | 跳转登录页 |
| 403无权限 | 弹出提示："您没有权限执行此操作" |
| 404不存在 | 刷新文件列表，提示文件已删除 |
| 上传失败 | 显示失败原因和重试按钮 |
| 文件过大 | 提示文件大小限制 |
| 服务器错误 | 弹出提示并记录日志 |

---

## 9. 项目结构

### 9.1 后端结构

```
backend/
├── main.py              # 应用入口
├── config.py            # 配置文件
├── database.py          # 数据库连接
├── models/
│   ├── __init__.py
│   ├── user.py          # 用户模型
│   └── file.py          # 文件模型
├── schemas/
│   ├── __init__.py
│   ├── user.py          # 用户Schema
│   └── file.py          # 文件Schema
├── routers/
│   ├── __init__.py
│   ├── auth.py          # 认证路由
│   └── files.py         # 文件路由
├── services/
│   ├── __init__.py
│   ├── auth.py          # 认证服务
│   └── file.py          # 文件服务
├── utils/
│   ├── __init__.py
│   ├── security.py       # 安全工具
│   └── file.py          # 文件工具
├── requirements.txt     # 依赖
└── storage/             # 文件存储目录
```

### 9.2 前端结构

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── main.jsx         # 入口文件
│   ├── App.jsx          # 根组件
│   ├── api/
│   │   ├── index.js     # API配置
│   │   ├── auth.js      # 认证API
│   │   └── files.js     # 文件API
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

## 10. 配置项

### 10.1 后端配置（config.py）

```python
# 数据库
DATABASE_URL = "mysql://user:password@localhost:3306/filemanager"

# JWT
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# 文件存储
STORAGE_PATH = "./storage"
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB

# 允许的文件类型
ALLOWED_EXTENSIONS = {'.txt', '.pdf', '.doc', '.docx', '.jpg', '.png', '.mp4', '.zip'}
```

### 10.2 前端配置

```javascript
// src/api/index.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
```

---

## 11. 部署方案

### 11.1 开发环境

- 后端：`uvicorn main:app --reload`
- 前端：`vite`
- 数据库：本地MySQL

### 11.2 生产环境

- 后端：Nginx + Uvicorn/Gunicorn
- 前端：Nginx 静态托管
- 数据库：独立MySQL服务器
- 反向代理：Nginx

### 11.3 Docker部署（可选）

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./storage:/app/storage
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: filemanager
```

---

## 12. 开发计划

### 12.1 第一阶段：基础功能

- [ ] 项目初始化
- [ ] 数据库连接和模型创建
- [ ] 用户认证API（注册、登录）
- [ ] 文件列表API
- [ ] 前端登录/注册页面
- [ ] 前端主界面基础布局

### 12.2 第二阶段：文件操作

- [ ] 创建文件夹API
- [ ] 文件上传API
- [ ] 文件下载API
- [ ] 文件删除API
- [ ] 文件重命名/移动API
- [ ] 前端文件列表展示
- [ ] 前端文件夹创建
- [ ] 前端文件上传
- [ ] 前端文件操作菜单

### 12.3 第三阶段：完善功能

- [ ] 文件搜索API
- [ ] 前端搜索功能
- [ ] 面包屑导航
- [ ] 左侧文件夹树
- [ ] 错误处理优化
- [ ] 加载状态优化

---

## 13. 验收标准

### 13.1 功能验收

- 用户可以注册和登录
- 用户可以创建文件夹
- 用户可以上传文件（支持拖拽）
- 用户可以下载文件
- 用户可以重命名文件/文件夹
- 用户可以移动文件/文件夹
- 用户可以删除文件/文件夹
- 用户可以搜索文件
- 文件夹可以嵌套
- 每个用户只能看到自己的文件

### 13.2 性能要求

- 文件上传：支持最大100MB文件
- 响应时间：API响应时间 < 500ms
- 并发支持：支持10个用户同时使用

### 13.3 安全要求

- 密码必须加密存储
- 所有API需要认证
- 用户之间文件隔离
- 防止路径遍历攻击

---

## 14. 附录

### 14.1 参考资料

- FastAPI文档：https://fastapi.tiangolo.com/
- React文档：https://react.dev/
- Vite文档：https://vitejs.dev/
- SQLAlchemy文档：https://docs.sqlalchemy.org/

### 14.2 术语表

| 术语 | 说明 |
|------|------|
| JWT | JSON Web Token，用于身份认证 |
| ORM | Object Relational Mapping，对象关系映射 |
| API | Application Programming Interface，应用程序接口 |
| REST | Representational State Transfer，RESTful API风格 |
