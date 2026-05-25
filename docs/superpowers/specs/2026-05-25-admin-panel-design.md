---
title: 管理员后台设计
date: 2026-05-25
status: approved
---

# 管理员后台设计

## 概述

为"罐头文件管理器"实现完整的独立管理后台，包含用户管理、文件管理、系统设置和操作日志，采用独立认证体系，前后端完全隔离。

## 数据库变更

### users 表新增字段

| 字段 | 类型 | 说明 |
|------|------|------|
| is_admin | Boolean | 是否管理员，默认 false |

### 新增表：admins

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer PK | 自增 |
| username | String(50) | 唯一 |
| password_hash | String(255) | - |
| email | String(100) | 唯一 |
| is_active | Boolean | 默认 true |
| created_at | DateTime | - |

### 新增表：audit_logs

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer PK | 自增 |
| admin_id | Integer FK(admins) | 操作管理员 |
| action | String(50) | login/logout/delete_user/toggle_user/delete_file/update_config |
| target_type | String(50) | user/file/config |
| target_id | Integer | 可空 |
| details | String(500) | 简要描述 |
| ip_address | String(45) | 操作 IP |
| created_at | DateTime | - |

### 新增表：system_configs

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer PK | 自增 |
| key | String(100) | 唯一键 |
| value | String(500) | 值 |
| updated_at | DateTime | - |

默认配置：storage_quota=10GB, allow_register=true, max_file_size=100MB, allowed_extensions=全允许

## 后端 API

### 管理员认证 /api/admin/auth

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /admin/auth/login | 管理员登录 |
| GET | /admin/auth/me | 获取当前管理员 |
| POST | /admin/auth/logout | 登出 |

认证机制：独立 JWT（ADMIN_SECRET_KEY），token 含 sub(admin_id) + role: "admin"

### 用户管理 /api/admin/users

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/users | 用户列表（分页、搜索） |
| GET | /admin/users/:id | 用户详情（含文件/存储统计） |
| PATCH | /admin/users/:id | 禁用/启用/重置密码 |
| DELETE | /admin/users/:id | 删除用户及所有文件 |

### 文件管理 /api/admin/files

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/files | 全局文件列表（分页、按用户筛选、搜索） |
| GET | /admin/files/:id | 文件详情 |
| DELETE | /admin/files/:id | 删除任意用户文件 |

### 仪表盘 /api/admin/dashboard

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/dashboard | 统计概览（用户数、文件数、总存储、今日活跃） |

### 配置管理 /api/admin/settings

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/settings | 获取所有配置 |
| PUT | /admin/settings | 批量更新配置 |

### 操作日志 /api/admin/audit-logs

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /admin/audit-logs | 日志列表（分页、按类型/时间筛选） |

所有管理 API 通过 get_current_admin 中间件保护，写操作自动记录 audit_logs。

## 前端页面

### 路由

```
/admin/login         → 管理员登录
/admin               → 仪表盘
/admin/users         → 用户管理
/admin/users/:id     → 用户详情
/admin/files         → 文件管理
/admin/settings      → 系统设置
/admin/audit-logs    → 操作日志
```

### 布局

暗色侧边栏(256px, #171717) + 白色内容区，独立 AdminLayout。

### 各页面要点

- **登录页**：居中卡片，品牌 Logo + "管理员登录"，与用户登录完全隔离
- **仪表盘**：4 张统计卡片 + 最近操作日志
- **用户管理**：搜索 + 表格（用户名/邮箱/文件数/存储/状态/操作），支持禁用/启用/删除
- **用户详情**：用户信息头部 + 文件表格
- **文件管理**：用户筛选 + 搜索 + 表格（文件名/所有者/大小/上传时间/删除）
- **系统设置**：存储配额/注册开关/文件大小/扩展名表单
- **操作日志**：类型筛选 + 表格（时间/管理员/操作/目标/IP）

### 前端文件结构

```
frontend/src/admin/
├── AdminApp.jsx
├── api/admin.js
├── context/AdminAuthContext.jsx
├── layouts/AdminLayout.jsx
├── pages/Login.jsx, Dashboard.jsx, Users.jsx, UserDetail.jsx, Files.jsx, Settings.jsx, AuditLogs.jsx
└── components/AdminSidebar.jsx, StatCard.jsx, DataTable.jsx, Toggle.jsx
```

在 App.jsx 中挂载 /admin/* 路由。

## 设计原则

- 遵循 Vercel 设计语言（颜色/字体/圆角/间距）
- 管理员与用户完全隔离（独立认证 + 独立路由）
- 关键操作记日志
- YAGNI：只建当前需要的功能
