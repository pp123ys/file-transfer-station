# 用户存储限额实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为每位用户添加 2GB 存储限额，超限时阻止上传并显示空间提醒。

**Architecture:** 后端在 config 中读取配额、新增 storage API 返回用量、上传时拦截超限请求；前端侧边栏底部新增进度条、上传弹窗显示剩余空间，均遵循现有 Vercel 设计系统。

**Tech Stack:** Python/FastAPI/SQLAlchemy (后端), React/Tailwind CSS (前端)

---

## 文件变更清单

| 操作 | 文件 |
|------|------|
| Modify | `backend/app/config.py` |
| Modify | `backend/app/schemas/file.py` |
| Modify | `backend/app/services/file.py` |
| Modify | `backend/app/routers/files.py` |
| Modify | `frontend/src/api/files.js` |
| Modify | `frontend/src/components/Sidebar.jsx` |
| Modify | `frontend/src/components/MobileDrawer.jsx` |
| Modify | `frontend/src/components/UploadModal.jsx` |
| Modify | `frontend/src/pages/Home.jsx` |
| Modify | `backend/.env.example` |

---

### Task 1: 后端 — 配置与 Schema

**Files:**
- Modify: `backend/app/config.py`
- Modify: `backend/app/schemas/file.py`
- Modify: `backend/.env.example`

- [ ] **Step 1: 添加存储配额配置**

在 `backend/app/config.py` 末尾添加：

```python
# 存储配额配置
STORAGE_QUOTA_GB = int(os.getenv("STORAGE_QUOTA_GB", "2"))
STORAGE_QUOTA_BYTES = STORAGE_QUOTA_GB * 1024 * 1024 * 1024
```

- [ ] **Step 2: 添加 StorageInfo Schema**

在 `backend/app/schemas/file.py` 末尾添加：

```python
class StorageInfo(BaseModel):
    used: int
    total: int
    available: int
```

- [ ] **Step 3: 更新 .env.example**

在 `backend/.env.example` 末尾添加：

```env
# 存储配额（GB），默认 2
STORAGE_QUOTA_GB=2
```

---

### Task 2: 后端 — 存储查询服务

**Files:**
- Modify: `backend/app/services/file.py`

- [ ] **Step 1: 在 FileService 中添加 get_storage_usage 静态方法**

在 `FileService` 类的 `search_files` 方法之前插入：

```python
    @staticmethod
    def get_storage_usage(db: Session, user: User) -> dict:
        """获取用户存储使用情况（含软删除文件）"""
        from app.config import STORAGE_QUOTA_BYTES
        from sqlalchemy import func
        
        result = db.query(func.coalesce(func.sum(File.size), 0)).filter(
            File.user_id == user.id
        ).scalar()
        
        used = int(result)
        total = STORAGE_QUOTA_BYTES
        available = max(0, total - used)
        
        return {"used": used, "total": total, "available": available}
```

---

### Task 3: 后端 — API 路由

**Files:**
- Modify: `backend/app/routers/files.py`

- [ ] **Step 1: 添加 imports**

在 `backend/app/routers/files.py` 顶部，修改 import 行：

将：
```python
from app.schemas.file import (
    FileResponse as FileSchema, FileListResponse, FolderCreate,
    FileUpdate, MessageResponse, FileType
)
```

改为：
```python
from app.schemas.file import (
    FileResponse as FileSchema, FileListResponse, FolderCreate,
    FileUpdate, MessageResponse, FileType, StorageInfo
)
```

- [ ] **Step 2: 添加 GET /api/files/storage 路由**

在 `search_files` 路由之前插入：

```python
@router.get("/storage", response_model=StorageInfo)
async def get_storage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户存储使用情况"""
    return FileService.get_storage_usage(db, current_user)
```

- [ ] **Step 3: 上传接口添加配额校验**

在 `upload_file` 函数中，`FileService.upload_file` 调用之前添加：

```python
    # 检查存储配额
    storage = FileService.get_storage_usage(db, current_user)
    if storage["used"] + (file.size or 0) > storage["total"]:
        raise HTTPException(
            status_code=413,
            detail=f"存储空间不足。已用 {storage['used'] / (1024**3):.1f} GB / {storage['total'] / (1024**3):.1f} GB"
        )
```

注意：`file.size` 在 FastAPI UploadFile 中为 `None` 时需要处理。由于上传时无法准确获取文件大小，改为先上传再校验。调整为在上传完成后校验：

将配额校验代码放在 `FileService.upload_file` 调用之后、返回之前：

```python
    uploaded_file = await FileService.upload_file(db, current_user, file, parent_id_int)
    
    # 检查存储配额：上传后若超出则回滚并提示
    storage = FileService.get_storage_usage(db, current_user)
    if storage["used"] > storage["total"]:
        # 回滚：删除刚上传的文件
        FileService.delete_file(db, current_user, uploaded_file.id, permanent=True)
        raise HTTPException(
            status_code=413,
            detail=f"存储空间不足。已用 {storage['used'] / (1024**3):.1f} GB（含待上传文件）超出配额 {storage['total'] / (1024**3):.1f} GB"
        )
    
    return FileSchema.model_validate(uploaded_file)
```

> **注意**：更优方案是在上传前用文件 Content-Length header 预估，但 FastAPI UploadFile 在完全接收前不暴露 size。当前方案先存后检，超出则回滚，简单可靠。

---

### Task 4: 前端 — API 层

**Files:**
- Modify: `frontend/src/api/files.js`

- [ ] **Step 1: 添加 getStorageInfo 方法**

在 `filesAPI` 对象末尾（`searchFiles` 之后）添加：

```javascript
  // 获取存储使用情况
  getStorageInfo: async () => {
    const response = await api.get('/api/files/storage');
    return response.data;
  },
```

---

### Task 5: 前端 — 侧边栏存储进度条

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

- [ ] **Step 1: 添加 storage prop 和进度条 UI**

修改组件签名，添加 `storage` prop：

将：
```jsx
export default function Sidebar({ onNavigate, currentFolderId, currentType, isTrashView }) {
```

改为：
```jsx
export default function Sidebar({ onNavigate, currentFolderId, currentType, isTrashView, storage }) {
```

- [ ] **Step 2: 在 sidebar 底部、`</aside>` 之前添加存储进度条**

在 `</aside>` 闭合标签之前插入：

```jsx
        {storage && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-hairline bg-canvas px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-caption-mono text-mute uppercase tracking-wider">存储空间</span>
              <span className="text-caption-mono text-mute">{Math.round(storage.used / storage.total * 100)}%</span>
            </div>
            <div className="w-full h-1 rounded-sm bg-hairline overflow-hidden">
              <div
                className={`h-full rounded-sm transition-all duration-300 ${
                  storage.used / storage.total > 0.95 ? 'bg-error' :
                  storage.used / storage.total > 0.8 ? 'bg-warning' : 'bg-ink'
                }`}
                style={{ width: `${Math.min(100, storage.used / storage.total * 100)}%` }}
              />
            </div>
            <p className="text-body-sm text-body mt-1">
              {(storage.used / (1024 ** 3)).toFixed(1)} GB / {(storage.total / (1024 ** 3)).toFixed(1)} GB
            </p>
          </div>
        )}
```

由于侧边栏使用 `fixed` 定位且 `h-[calc(100vh-4rem)]`，底部进度条使用 `absolute bottom-0` 是合理的。但需要给导航区域留出底部间距，避免被进度条遮挡。在 `<nav className="space-y-1">` 的父容器 `<div className="p-4">` 上添加 `pb-20`：

将：
```jsx
      <div className="p-4">
```

改为：
```jsx
      <div className="p-4 pb-20">
```

---

### Task 6: 前端 — 移动端抽屉存储进度条

**Files:**
- Modify: `frontend/src/components/MobileDrawer.jsx`

- [ ] **Step 1: 查看 MobileDrawer 结构并添加 storage prop 和进度条**

首先确认 MobileDrawer 的 prop 和底部结构：

```jsx
export default function MobileDrawer({ isOpen, onClose, onNavigate, currentFolderId, currentType, isTrashView, storage }) {
```

在抽屉内容底部、关闭按钮之前添加与 Sidebar 相同的进度条组件。找到抽屉中搜索框或菜单列表之后的位置，插入：

```jsx
          {storage && (
            <div className="border-t border-hairline px-4 py-3 mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-caption-mono text-mute uppercase tracking-wider">存储空间</span>
                <span className="text-caption-mono text-mute">{Math.round(storage.used / storage.total * 100)}%</span>
              </div>
              <div className="w-full h-1 rounded-sm bg-hairline overflow-hidden">
                <div
                  className={`h-full rounded-sm transition-all duration-300 ${
                    storage.used / storage.total > 0.95 ? 'bg-error' :
                    storage.used / storage.total > 0.8 ? 'bg-warning' : 'bg-ink'
                  }`}
                  style={{ width: `${Math.min(100, storage.used / storage.total * 100)}%` }}
                />
              </div>
              <p className="text-body-sm text-body mt-1">
                {(storage.used / (1024 ** 3)).toFixed(1)} GB / {(storage.total / (1024 ** 3)).toFixed(1)} GB
              </p>
            </div>
          )}
```

---

### Task 7: 前端 — 上传弹窗剩余空间提示

**Files:**
- Modify: `frontend/src/components/UploadModal.jsx`

- [ ] **Step 1: 添加 storage prop**

在组件 props 解构中添加 `storage`：

将：
```jsx
export default function UploadModal({ isOpen, onClose, onUpload, currentFolder, isMobile = false }) {
```

改为：
```jsx
export default function UploadModal({ isOpen, onClose, onUpload, currentFolder, isMobile = false, storage }) {
```

- [ ] **Step 2: 在拖拽区域上方添加剩余空间提示**

在文件拖拽区域（`drop zone` div）之前插入：

```jsx
            {storage && (
              <div className={`mb-2 text-body-sm ${storage.available === 0 ? 'text-error' : 'text-mute'}`}>
                {storage.available === 0
                  ? '存储空间已满，请清理后重试'
                  : `剩余空间：${storage.available > 1024 ** 3
                      ? (storage.available / (1024 ** 3)).toFixed(1) + ' GB'
                      : (storage.available / (1024 ** 2)).toFixed(0) + ' MB'}`
                }
              </div>
            )}
```

- [ ] **Step 3: 空间已满时禁用拖拽区域**

当 `storage.available === 0` 时，将拖拽区域替换为提示。找到 drop zone 区域，添加条件渲染：空间不足时不渲染 drop zone，替换为警告信息。

---

### Task 8: 前端 — Home 页面整合

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: 添加 storage 状态和加载逻辑**

在 Home 组件中添加：

```jsx
  const [storage, setStorage] = useState(null);
```

在 `useEffect` 中添加获取存储信息的调用（与 fetchFiles 并列）：

```javascript
  const fetchStorage = async () => {
    try {
      const data = await filesAPI.getStorageInfo();
      setStorage(data);
    } catch (err) {
      console.error('获取存储信息失败', err);
    }
  };
```

在 `useEffect` 中调用 `fetchStorage()`，并在文件操作后刷新（上传成功、永久删除后）。

- [ ] **Step 2: 传递 storage 给子组件**

给 Sidebar、MobileDrawer、UploadModal 传递 `storage` prop：

```jsx
<Sidebar ... storage={storage} />
<MobileDrawer ... storage={storage} />
<UploadModal ... storage={storage} />
```

- [ ] **Step 3: 上传成功后刷新存储信息**

在 `handleUpload` 或 `onUpload` 回调成功后调用 `fetchStorage()`。

- [ ] **Step 4: 永久删除后刷新存储信息**

在 `handlePermanentDelete` 成功后调用 `fetchStorage()`。

---

### Task 9: 后端配置同步 — .env 文件更新

**Files:**
- Modify: `backend/.env`

- [ ] **Step 1: 添加配置项**

在 `backend/.env` 中添加：

```env
STORAGE_QUOTA_GB=2
```

---

### Task 10: 验证

- [ ] **Step 1: 启动后端验证 API**

```bash
cd backend
uvicorn app.main:app --reload
```

访问 `http://localhost:8000/docs`，测试：
1. `GET /api/files/storage` 返回 `{used, total, available}`
2. 上传小文件后 `used` 增加
3. 上传超大文件返回 413

- [ ] **Step 2: 启动前端验证 UI**

```bash
cd frontend
npm run dev
```

验证：
1. 侧边栏底部显示存储进度条
2. 上传弹窗显示剩余空间
3. 进度条颜色：正常 ink / 80%+ warning / 95%+ error
4. 移动端抽屉底部也显示进度条

- [ ] **Step 3: 端到端测试**

1. 上传文件 → 进度条数字增加
2. 文件移到回收站 → 进度条不变（软删除仍计入）
3. 永久删除 → 进度条减少
4. 空间满时上传 → 提示存储空间不足
