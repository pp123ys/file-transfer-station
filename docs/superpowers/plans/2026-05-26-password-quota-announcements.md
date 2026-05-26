# 密码管理 · 用户配额 · 公告系统 实现计划

> 按顺序执行 17 个 Task | 详情见设计文档 specs/2026-05-26-password-quota-design.md

## 后端 (Task 1-9)
1. SQL 迁移文件 (add_storage_quota + create_announcements)
2. User 模型新增 storage_quota_gb
3. Announcement 模型
4. Pydantic Schemas
5. PUT /api/auth/change-password
6. PUT /api/admin/users/:id/password + /quota
7. 公告 CRUD 路由 (用户端 + 管理端)
8. main.py 注册路由/模型
9. FileService.get_storage_usage 支持个人配额

## 前端 (Task 10-17)
10. API 层 (auth.changePassword + admin APIs + announcements API)
11. Login 页忘记密码弹窗
12. Profile 页修改密码卡片
13. AnnouncementBanner 组件 + Home 页集成
14. Admin UserDetail 页密码管理+配额管理
15. Admin Users 列表配额列
16. Admin Announcements 管理页
17. App.jsx 路由 + AdminSidebar 导航
