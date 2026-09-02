# 罐头文件管理器（CloudFileManager）

前后端分离的**私有云盘 / 文件管理系统**，部署于本地服务器，为个人与团队提供安全的文件存储、预览与共享服务。包含用户端文件管理界面与管理后台两套前端。

## 功能

**用户端**
- 多用户账号：注册（邮箱验证码）/ 登录 / 个人中心 / 修改密码
- 文件管理：上传（拖拽 + 进度）、下载、多格式预览、图片缩略图
- 树形目录（无限层级）、重命名、移动、搜索
- 回收站：软删除、恢复、永久删除
- 存储配额（默认 10GB/用户，管理员可单独调整）
- 公告横幅、移动端响应式适配

**管理后台**
- 仪表盘（用户/文件/存储统计）
- 用户管理（禁用、配额、密码重置）、文件管理
- 公告发布、审计日志（含 IP）、系统配置与 SMTP 邮件配置

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 · Vite · TailwindCSS · Axios · React Router |
| 后端 | Python · FastAPI · SQLAlchemy |
| 数据库 | MySQL 8 |
| 认证 | 双 JWT（用户 + 管理员独立密钥）、bcrypt 密码哈希 |
| 部署 | Nginx 反向代理（`nginx_prod.conf`）+ 脚本化部署（`deploy_changes.py` / `upload_frontend.py`） |

规模参考：11 个路由模块、47 个 REST API 端点、8 张数据表。

## 快速开始

```bash
# 后端（backend/ 目录）
cp .env.example .env        # 填入数据库/JWT/SMTP 配置
pip install -r requirements.txt
python create_default_admin.py          # 创建默认管理员（admin）
uvicorn app.main:app --reload --port 8000

# 前端（frontend/ 目录）
cp .env.example .env
npm install && npm run dev              # http://localhost:5173
```

Windows 一键启动：根目录运行 `start.bat`。

## 安全设计

- 密码 bcrypt 哈希存储；用户与管理员 JWT 使用独立密钥、完全隔离
- 文件按用户隔离，操作校验所有权；路径遍历防护
- 删除一律软删除（移入回收站，可恢复或永久删除）
- 上传大小/类型限制、存储配额实时校验
- 管理员敏感操作全量审计日志（含 IP）

## 目录结构

```
backend/    FastAPI 后端（routers / services / models / schemas）
frontend/   React 用户端 + admin 管理后台（src/admin/）
docs/       设计规范与实施计划（specs / plans）
vercel/     Vercel 风格设计系统参考
```

## 文档

- [项目入职指南（架构导览）](docs/ONBOARDING.md)
- [设计文档](docs/superpowers/specs/2026-05-22-file-manager-design.md)
