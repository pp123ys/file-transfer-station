# 密码管理 · 用户配额 · 公告系统 - 设计文档

> 日期: 2026-05-26 | 状态: 已确认

## 需求概述

### 密码管理
1. **用户修改密码**：已登录用户在个人设置页通过旧密码验证后修改密码
2. **忘记密码**：登录页弹窗提示联系管理员邮箱 `3378511142@qq.com`
3. **管理员修改用户密码**：管理员后台直接修改任意用户密码

### 用户配额
4. **管理员调整用户配额**：管理员为每个用户设置独立的存储配额（GB）

### 公告系统
5. **管理员发布公告**：支持多条公告管理，Markdown 内容，可选弹窗/横幅展示，可置顶、可启用/停用
6. **用户首页展示**：根据公告配置，首页顶部横幅或登录后弹窗展示，用户可关闭横幅

---

## 一、密码与配额 - 后端设计

### 数据模型变更

**User 表新增字段：**
```sql
ALTER TABLE users ADD COLUMN storage_quota_gb INTEGER DEFAULT NULL;
```
- `NULL` = 使用全局默认配额
- 有值 = 该用户独立配额（GB）

### 新增 API 端点

| 端点 | 认证 | 说明 |
|------|------|------|
| `PUT /api/auth/change-password` | 用户 | `{old_password, new_password}` 修改密码 |
| `PUT /api/admin/users/{id}/password` | 管理员 | `{new_password}` 直接改密 |
| `PUT /api/admin/users/{id}/quota` | 管理员 | `{storage_quota_gb}` 设配额，null=重置为全局默认 |

### 现有逻辑调整

- `FileService.get_storage_usage()`：优先取 `user.storage_quota_gb`，NULL 时回退全局配额
- 管理员用户列表/详情接口追加 `storage_quota_gb` 字段

---

## 二、公告系统 - 后端设计

### 新增数据表

```sql
CREATE TABLE announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,          -- 公告标题
    content TEXT NOT NULL,                 -- Markdown 内容
    display_type VARCHAR(20) DEFAULT ''banner'', -- banner / modal
    is_pinned BOOLEAN DEFAULT FALSE,       -- 是否置顶
    is_active BOOLEAN DEFAULT TRUE,        -- 是否生效
    created_by INTEGER NOT NULL,           -- 发布管理员 ID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE announcement_dismissals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    announcement_id INTEGER NOT NULL,      -- 公告 ID
    user_id INTEGER NOT NULL,              -- 关闭的用户 ID
    dismissed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(announcement_id, user_id)
);
```

### 新增 API 端点

**用户端：**

| 端点 | 认证 | 说明 |
|------|------|------|
| `GET /api/announcements/active` | 用户 | 获取当前生效且未关闭的公告列表 |
| `POST /api/announcements/{id}/dismiss` | 用户 | 关闭某条横幅公告 |

**管理端：**

| 端点 | 认证 | 说明 |
|------|------|------|
| `GET /api/admin/announcements` | 管理员 | 公告列表（分页） |
| `POST /api/admin/announcements` | 管理员 | 创建公告 |
| `PUT /api/admin/announcements/{id}` | 管理员 | 编辑公告 |
| `DELETE /api/admin/announcements/{id}` | 管理员 | 删除公告 |
| `PATCH /api/admin/announcements/{id}/toggle` | 管理员 | 启用/停用切换 |

### 公告获取逻辑

用户请求 `GET /api/announcements/active`：
1. 查询所有 `is_active = TRUE` 的公告，按 `is_pinned DESC, created_at DESC` 排序
2. 排除该用户已 `dismiss` 的横幅类型公告
3. Modal 类型公告不受 dismiss 影响（每次都展示）
4. 返回结果供前端渲染

---

## 三、前端设计

### 登录页 — 忘记密码
- 登录表单下方"忘记密码？"链接
- 点击弹出 Modal："请联系管理员：3378511142@qq.com"

### 个人设置页 — 修改密码
- 新增"修改密码"卡片（旧密码 + 新密码 + 确认新密码）
- 前端校验：新密码长度 ≥6、两次一致

### 首页 — 公告展示
- 文件列表上方渲染公告区：
  - **Banner**：彩色横幅，显示标题 + Markdown 内容，右侧关闭按钮(×)，关闭后调用 dismiss API
  - **Modal**：登录后自动弹出，显示标题 + Markdown 内容，底部"知道了"按钮关闭
- 置顶公告优先展示，多条横幅竖直排列

### 管理后台 — 用户详情页
- "密码管理"区域：新密码输入 + 修改按钮
- "存储配额"区域：显示当前配额，输入 GB 值 + 保存，重置为默认按钮

### 管理后台 — 用户列表
- 表格增加"存储使用"列：`已用 / 配额`

### 管理后台 — 公告管理页
- 公告列表表格：标题、类型（弹窗/横幅）、置顶、状态、发布时间
- 新建/编辑公告表单：标题、内容（Markdown 编辑器）、展示类型、置顶开关、启用开关
- 删除确认弹窗

---

## 四、文件变更清单

| 文件 | 类型 | 说明 |
|------|------|------|
| `backend/app/models/user.py` | 修改 | 新增 `storage_quota_gb` |
| `backend/app/models/announcement.py` | 新增 | 公告 + 关闭记录模型 |
| `backend/add_storage_quota.sql` | 新增 | 数据库迁移 SQL |
| `backend/create_announcements.sql` | 新增 | 公告表创建 SQL |
| `backend/app/routers/auth.py` | 修改 | 新增 `change_password` |
| `backend/app/routers/admin_users.py` | 修改 | 新增改密码 + 改配额 + 配额字段 |
| `backend/app/routers/announcements.py` | 新增 | 用户端公告 API |
| `backend/app/routers/admin_announcements.py` | 新增 | 管理端公告 CRUD |
| `backend/app/services/file.py` | 修改 | 个人配额优先 |
| `backend/app/schemas/user.py` | 修改 | 新增 schema |
| `backend/app/schemas/announcement.py` | 新增 | 公告 schema |
| `backend/app/main.py` | 修改 | 注册公告路由 |
| `frontend/src/pages/Login.jsx` | 修改 | 忘记密码弹窗 |
| `frontend/src/pages/Profile.jsx` | 修改 | 修改密码卡片 |
| `frontend/src/pages/Home.jsx` | 修改 | 公告展示区 |
| `frontend/src/components/AnnouncementBanner.jsx` | 新增 | 横幅公告组件 |
| `frontend/src/admin/pages/UserDetail.jsx` | 修改 | 密码 + 配额管理 |
| `frontend/src/admin/pages/Users.jsx` | 修改 | 配额列 |
| `frontend/src/admin/pages/Announcements.jsx` | 新增 | 公告管理页 |
| `frontend/src/App.jsx` | 修改 | 注册公告管理路由 |

## 五、不修改的现有功能
- 用户注册/登录逻辑不变
- 文件 CRUD / 回收站逻辑不变
- 全局存储配额配置不变
- 用户禁用/启用/删除不变
