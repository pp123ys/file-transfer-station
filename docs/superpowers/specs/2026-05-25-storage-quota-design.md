# 用户存储限额设计规范

## 概述

为文件传输站项目添加用户存储限额功能，每位用户拥有 2GB 存储空间上限。达到限额后阻止上传并显示空间提醒，遵循 Vercel 设计系统。

## 设计目标

1. **存储管控**：每位用户最多使用 2GB 存储空间
2. **主动提醒**：侧边栏常驻显示存储用量，上传时显示剩余空间
3. **限额拦截**：上传时若超出限额则拒绝并提示
4. **释放机制**：软删除文件仍计入空间，永久删除后释放
5. **Vercel 设计规范**：完全遵循现有 Vercel 设计系统的颜色、排版、间距规范

## 空间计算规则

| 规则 | 说明 |
|------|------|
| 计入范围 | 所有文件（`is_deleted=False` 和 `is_deleted=True` 均计入） |
| 不计入 | 文件夹本身（`size=0`） |
| 释放条件 | 永久删除（`DELETE /api/files/{id}/permanent`） |
| 配额上限 | `.env` 中 `STORAGE_QUOTA_GB` 配置，默认 2 |

## 后端设计

### 配置

`backend/.env` 新增：

```env
STORAGE_QUOTA_GB=2
```

`backend/app/config.py` 新增读取：

```python
STORAGE_QUOTA_BYTES = int(os.getenv("STORAGE_QUOTA_GB", "2")) * 1024 * 1024 * 1024
```

### 新增 API

**`GET /api/files/storage`** — 获取当前用户存储使用情况

响应：
```json
{
  "used": 1288490188,
  "total": 2147483648,
  "available": 858993460
}
```

实现：统计 `files` 表中当前用户所有记录（含软删除）的 `size` 之和。

### 上传拦截

`POST /api/files/upload` 中增加校验逻辑：

1. 计算 `used + file.size`
2. 若超过 `STORAGE_QUOTA_BYTES`，返回 HTTP `413 Content Too Large`
3. 响应体包含 `detail` 字段说明已用/总量/剩余

### 永久删除优化

`DELETE /api/files/{id}/permanent` 确认：物理删除文件记录后，下次查询存储空间时自动反映释放结果。

## 前端设计

### 1. 侧边栏存储进度条（Sidebar 底部新增）

遵循 Vercel 极简风格：

```
┌──────────────────────────┐
│  (现有导航菜单)           │
│                          │
├──────────────────────────┤
│  存储空间                 │  ← text-caption-mono, text-mute
│  ┌────────────────────┐  │
│  │████████░░░░░░  60% │  │  ← 进度条：hairline 底色, ink 填充
│  └────────────────────┘  │      高度 4px, 圆角 6px
│  1.2 GB / 2.0 GB         │  ← text-body-sm, text-body
└──────────────────────────┘
```

设计细节：

| 属性 | 值 |
|------|-----|
| 区域背景 | `bg-canvas` |
| 顶部分隔线 | `border-t border-hairline` |
| 内边距 | `px-4 py-3` |
| 标签字体 | `text-caption-mono text-mute uppercase tracking-wider` |
| 进度条高度 | `h-1` (4px) |
| 进度条圆角 | `rounded-sm` (6px) |
| 进度条底色 | `bg-hairline` |
| 进度条填充 | `bg-ink` |
| 用量数字字体 | `text-body-sm text-body` |
| 进度百分比 | 填充区域右端显示，`text-caption-mono` |
| 超 80% 警告 | 进度条填充色变为 `bg-warning` |
| 超 95% 警告 | 进度条填充色变为 `bg-error` |

**移动端适配**：进度条纳入 MobileDrawer 底部，布局保持一致。

### 2. 上传弹窗剩余空间提示（UploadModal 新增）

```
┌──────────────────────────────┐
│  上传文件                     │
│                              │
│  剩余空间：800 MB             │  ← text-body-sm, text-mute
│                              │
│  ┌────────────────────────┐  │
│  │  拖拽文件到此处          │  │
│  │  或点击选择              │  │
│  └────────────────────────┘  │
│                              │
│  [取消]  [上传]              │
└──────────────────────────────┘
```

设计细节：

| 属性 | 值 |
|------|-----|
| 位置 | 上传区域上方 |
| 间距 | `mb-2` |
| 正常状态 | `text-body-sm text-mute` |
| 拖拽文件将超限时 | `text-body-sm text-error` + 上传按钮 disabled |
| 已超限时 | 上传区域替换为警告信息"存储空间已满，请清理后重试" |

**移动端适配**：底部抽屉布局（已有），剩余空间信息保持在拖拽区域上方。

### 3. 超限提示体验

| 场景 | 行为 |
|------|------|
| 上传前空间不足 | 上传按钮 disabled，显示红色提示文字 |
| 上传中空间不足 | API 返回 413，弹窗显示错误 toast "存储空间不足，剩余 XXX MB" |
| 侧边栏进度条 | 超 80% 黄色，超 95% 红色，始终可见 |

## 技术实现要点

### 后端

- `app/config.py`：新增 `STORAGE_QUOTA_BYTES` 配置项
- `app/services/file.py`：新增 `get_storage_usage()` 方法
- `app/routers/files.py`：新增 `GET /api/files/storage` 路由、上传前拦截
- `app/schemas/file.py`：新增 `StorageInfo` schema

### 前端

- `api/files.js`：新增 `getStorageInfo()` API 调用
- `components/Sidebar.jsx`：底部新增存储进度条区块
- `components/MobileDrawer.jsx`：底部新增存储进度条区块
- `components/UploadModal.jsx`：新增剩余空间显示 + 超限拦截
- `pages/Home.jsx`：引入 storage 状态，传递给相关组件

## 边界情况

| 场景 | 处理 |
|------|------|
| 用户首次使用（已用 0） | 进度条显示 0%，上传弹窗显示"剩余 2.0 GB" |
| 硬删除释放空间 | 无需额外处理，下次查询自动反映 |
| 前后两次上传大文件（中间无删除） | 新文件大小替换旧文件大小（先删后传） |
| 并发上传 | 每次上传单独校验，不做乐观锁（简单场景下可接受） |
| 文件夹大小 | 始终为 0，不计入存储空间 |
