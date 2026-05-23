# 移动端响应式支持实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为文件传输站添加完整的移动端响应式支持，遵循 Vercel 设计系统规范

**Architecture:** 采用渐进式响应式改造方案，基于 Tailwind CSS 的响应式能力，通过添加移动端断点样式、改造关键组件、添加手势交互库来实现移动端支持。保持桌面端现有功能不变，移动端提供完整功能体验。

**Tech Stack:** React 18, Tailwind CSS 3, Vite 5, @use-gesture/react, framer-motion

---

## 文件结构

### 新增文件
- `frontend/src/components/MobileDrawer.jsx` - 移动端抽屉导航组件
- `frontend/src/components/MobileFileCard.jsx` - 移动端文件卡片组件
- `frontend/src/components/MobileFAB.jsx` - 浮动操作按钮组件
- `frontend/src/components/ActionSheet.jsx` - 底部操作面板组件
- `frontend/src/hooks/useMediaQuery.js` - 响应式媒体查询 Hook

### 修改文件
- `frontend/package.json` - 添加手势交互依赖
- `frontend/tailwind.config.js` - 扩展响应式断点
- `frontend/src/styles/index.css` - 添加移动端工具类
- `frontend/src/components/Navbar.jsx` - 添加移动端汉堡菜单
- `frontend/src/components/Sidebar.jsx` - 支持抽屉模式
- `frontend/src/components/FileList.jsx` - 支持网格视图
- `frontend/src/components/FileItem.jsx` - 支持卡片模式
- `frontend/src/components/UploadModal.jsx` - 支持底部抽屉
- `frontend/src/components/PreviewModal.jsx` - 支持全屏模式
- `frontend/src/components/CreateFolderModal.jsx` - 支持底部抽屉
- `frontend/src/components/ContextMenu.jsx` - 支持 Action Sheet
- `frontend/src/pages/Home.jsx` - 响应式布局调整

---

## Task 1: 安装依赖和扩展配置

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/styles/index.css`

- [ ] **Step 1: 安装手势交互和动画库**

```bash
cd frontend && npm install @use-gesture/react framer-motion
```

- [ ] **Step 2: 扩展 Tailwind 响应式断点配置**

修改 `frontend/tailwind.config.js`，在 `theme.extend` 中添加 `screens` 配置：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'mobile': { 'max': '599px' },
        'tablet': { 'min': '600px', 'max': '959px' },
        'desktop': { 'min': '960px' },
      },
      colors: {
        // ... 保持现有颜色配置
```

- [ ] **Step 3: 添加移动端工具类到 CSS**

在 `frontend/src/styles/index.css` 末尾添加：

```css
/* 移动端触摸区域最小尺寸 */
@layer utilities {
  .touch-target {
    min-width: 44px;
    min-height: 44px;
  }
  
  /* 移动端底部抽屉基础样式 */
  .bottom-drawer {
    @apply fixed bottom-0 left-0 right-0 bg-canvas rounded-t-xl shadow-level-5 z-50;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  /* 移动端底部抽屉动画 */
  .bottom-drawer-enter {
    transform: translateY(100%);
  }
  
  .bottom-drawer-enter-active {
    transform: translateY(0);
    transition: transform 300ms ease-out;
  }
  
  .bottom-drawer-exit {
    transform: translateY(0);
  }
  
  .bottom-drawer-exit-active {
    transform: translateY(100%);
    transition: transform 300ms ease-in;
  }
}

/* 移动端安全区域适配 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

- [ ] **Step 4: 提交配置更改**

```bash
git add frontend/package.json frontend/package-lock.json frontend/tailwind.config.js frontend/src/styles/index.css
git commit -m "chore: 添加移动端响应式配置和依赖"
```

---

## Task 2: 创建响应式媒体查询 Hook

**Files:**
- Create: `frontend/src/hooks/useMediaQuery.js`

- [ ] **Step 1: 创建 useMediaQuery Hook**

创建文件 `frontend/src/hooks/useMediaQuery.js`：

```javascript
import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 599px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 600px) and (max-width: 959px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 960px)');
}
```

- [ ] **Step 2: 提交 Hook 文件**

```bash
git add frontend/src/hooks/useMediaQuery.js
git commit -m "feat: 添加响应式媒体查询 Hook"
```

---

## Task 3: 创建移动端抽屉导航组件

**Files:**
- Create: `frontend/src/components/MobileDrawer.jsx`

- [ ] **Step 1: 创建 MobileDrawer 组件**

创建文件 `frontend/src/components/MobileDrawer.jsx`：

```javascript
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileDrawer({ 
  isOpen, 
  onClose, 
  onNavigate, 
  currentFolderId, 
  currentType, 
  isTrashView,
  onSearch 
}) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'all', label: '全部文件', icon: 'folder' },
    { id: 'documents', label: '文档', icon: 'file-text' },
    { id: 'images', label: '图片', icon: 'image' },
    { id: 'videos', label: '视频', icon: 'video' },
    { id: 'trash', label: '回收站', icon: 'trash' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      'folder': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      'file-text': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'image': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'video': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'trash': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    };
    return icons[iconName] || icons['folder'];
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
      onClose();
    }
  };

  const handleNavigate = (item) => {
    onNavigate(item);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-canvas z-50 shadow-level-5 overflow-y-auto"
          >
            <div className="p-4 border-b border-hairline">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gradient-develop-start to-gradient-develop-end flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="text-display-sm font-semibold text-ink">罐头</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-mute hover:text-ink transition-colors touch-target"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文件..."
                  className="w-full bg-canvas-soft border border-hairline rounded-md px-4 py-3 text-body-md text-ink placeholder:text-mute focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mute hover:text-ink"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            <div className="p-4">
              <h2 className="text-caption-mono text-mute uppercase tracking-wider mb-3">快速访问</h2>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item)}
                    className={`w-full flex items-center px-3 py-3 rounded-md text-body-md transition-all duration-200 touch-target ${
                      (item.id === 'all' && !currentFolderId && !currentType && !isTrashView) || 
                      (item.id === 'trash' && isTrashView) || 
                      (item.id !== 'all' && item.id !== 'trash' && currentType === item.id)
                        ? 'bg-canvas-soft text-ink font-medium'
                        : 'text-body hover:text-ink hover:bg-canvas-soft'
                    }`}
                  >
                    {getIcon(item.icon)}
                    <span className="ml-3">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6">
                <h2 className="text-caption-mono text-mute uppercase tracking-wider mb-3">我的文件夹</h2>
                <button
                  onClick={() => handleNavigate(null)}
                  className={`w-full flex items-center px-3 py-3 rounded-md text-body-md transition-all duration-200 touch-target ${
                    currentFolderId === null
                      ? 'bg-canvas-soft text-ink font-medium'
                      : 'text-body hover:text-ink hover:bg-canvas-soft'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="ml-3">根目录</span>
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-hairline bg-canvas safe-area-bottom">
              <div className="flex items-center mb-4 px-3">
                <div className="w-10 h-10 rounded-full bg-canvas-soft flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-body-md-strong text-ink">{user?.username}</span>
              </div>
              <a
                href="/profile"
                className="block px-3 py-3 text-body-md text-body hover:text-ink hover:bg-canvas-soft rounded-md touch-target"
              >
                个人资料
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-3 text-body-md text-body hover:text-ink hover:bg-canvas-soft rounded-md touch-target"
              >
                退出登录
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

需要在文件顶部添加 `import { useState } from 'react';`

- [ ] **Step 2: 提交 MobileDrawer 组件**

```bash
git add frontend/src/components/MobileDrawer.jsx
git commit -m "feat: 添加移动端抽屉导航组件"
```

---

## Task 4: 创建浮动操作按钮组件

**Files:**
- Create: `frontend/src/components/MobileFAB.jsx`

- [ ] **Step 1: 创建 MobileFAB 组件**

创建文件 `frontend/src/components/MobileFAB.jsx`：

```javascript
import { motion } from 'framer-motion';

export default function MobileFAB({ onClick, icon }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-white shadow-level-4 flex items-center justify-center z-30 touch-target"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {icon || (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      )}
    </motion.button>
  );
}

export function UploadFAB({ onClick }) {
  return (
    <MobileFAB
      onClick={onClick}
      icon={
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      }
    />
  );
}
```

- [ ] **Step 2: 提交 MobileFAB 组件**

```bash
git add frontend/src/components/MobileFAB.jsx
git commit -m "feat: 添加移动端浮动操作按钮组件"
```

---

## Task 5: 创建移动端文件卡片组件

**Files:**
- Create: `frontend/src/components/MobileFileCard.jsx`

- [ ] **Step 1: 创建 MobileFileCard 组件**

创建文件 `frontend/src/components/MobileFileCard.jsx`：

```javascript
import { motion } from 'framer-motion';

export default function MobileFileCard({ file, onClick, onLongPress, isTrashView }) {
  const getFileIcon = (name, isFolder) => {
    if (isFolder) {
      return (
        <svg className="w-10 h-10 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    }

    const ext = name.split('.').pop().toLowerCase();
    const iconColors = {
      'pdf': 'text-error',
      'doc': 'text-blue-600',
      'docx': 'text-blue-600',
      'xls': 'text-green-600',
      'xlsx': 'text-green-600',
      'ppt': 'text-orange-600',
      'pptx': 'text-orange-600',
      'jpg': 'text-purple-600',
      'jpeg': 'text-purple-600',
      'png': 'text-purple-600',
      'gif': 'text-purple-600',
      'mp4': 'text-cyan',
      'zip': 'text-amber-600',
      'rar': 'text-amber-600',
    };

    const color = iconColors[ext] || 'text-body';

    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return (
        <svg className={`w-10 h-10 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }

    if (ext === 'mp4') {
      return (
        <svg className={`w-10 h-10 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return (
      <svg className={`w-10 h-10 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const handleTouchStart = (e) => {
    const timer = setTimeout(() => {
      if (onLongPress) {
        onLongPress(e);
      }
    }, 500);
    e.currentTarget.dataset.longPressTimer = timer;
  };

  const handleTouchEnd = (e) => {
    const timer = e.currentTarget.dataset.longPressTimer;
    if (timer) {
      clearTimeout(parseInt(timer));
    }
  };

  return (
    <motion.div
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onLongPress) onLongPress(e);
      }}
      className="bg-canvas rounded-lg shadow-level-2 p-4 flex flex-col items-center justify-center min-h-[100px] touch-target"
      whileTap={{ scale: 0.98 }}
    >
      <div className="mb-2">
        {getFileIcon(file.name, file.is_folder)}
      </div>
      <p className="text-body-sm text-ink text-center truncate w-full">
        {file.name}
      </p>
      <p className="text-caption text-mute mt-1">
        {file.is_folder ? `${file.item_count || 0} 项目` : formatSize(file.size)}
      </p>
    </motion.div>
  );
}
```

- [ ] **Step 2: 提交 MobileFileCard 组件**

```bash
git add frontend/src/components/MobileFileCard.jsx
git commit -m "feat: 添加移动端文件卡片组件"
```

---

## Task 6: 创建底部操作面板组件

**Files:**
- Create: `frontend/src/components/ActionSheet.jsx`

- [ ] **Step 1: 创建 ActionSheet 组件**

创建文件 `frontend/src/components/ActionSheet.jsx`：

```javascript
import { motion, AnimatePresence } from 'framer-motion';

export default function ActionSheet({ isOpen, onClose, title, actions }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-canvas rounded-t-xl shadow-level-5 z-50 safe-area-bottom"
          >
            {title && (
              <div className="px-4 py-3 border-b border-hairline text-center">
                <p className="text-body-md-strong text-ink">{title}</p>
              </div>
            )}
            <div className="p-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.onClick();
                    onClose();
                  }}
                  disabled={action.disabled}
                  className={`w-full flex items-center justify-center px-4 py-4 rounded-lg text-body-md transition-colors touch-target ${
                    action.destructive
                      ? 'text-error hover:bg-error-soft'
                      : action.disabled
                      ? 'text-mute cursor-not-allowed'
                      : 'text-ink hover:bg-canvas-soft'
                  }`}
                >
                  {action.icon && <span className="mr-3">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
            <div className="p-2 pt-0">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center px-4 py-4 rounded-lg text-body-md text-ink bg-canvas-soft hover:bg-hairline transition-colors touch-target"
              >
                取消
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: 提交 ActionSheet 组件**

```bash
git add frontend/src/components/ActionSheet.jsx
git commit -m "feat: 添加底部操作面板组件"
```

---

## Task 7: 改造 Navbar 支持移动端

**Files:**
- Modify: `frontend/src/components/Navbar.jsx`

- [ ] **Step 1: 改造 Navbar 组件添加移动端支持**

修改 `frontend/src/components/Navbar.jsx`，添加移动端汉堡菜单：

```javascript
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function Navbar({ onUploadClick, onSearch, onMenuClick }) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <nav className="bg-canvas border-b border-hairline sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 tablet:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 mr-2 text-ink hover:bg-canvas-soft rounded-md transition-colors touch-target"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gradient-develop-start to-gradient-develop-end flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="text-display-sm font-semibold text-ink">罐头</span>
          </div>
        </div>

        {!isMobile && (
          <>
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索文件..."
                  className="w-full bg-canvas-soft border border-hairline rounded-md px-4 py-2 text-sm text-ink placeholder:text-mute focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-mute hover:text-ink"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={onUploadClick}
                className="btn-primary text-body-sm-strong h-9 px-4"
              >
                <svg className="w-4 h-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                上传
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-body-sm-strong text-body hover:text-ink transition-colors px-3 py-2 rounded-full hover:bg-canvas-soft"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden sm:inline">{user?.username}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-canvas rounded-md shadow-level-5 py-2 z-50">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-body-sm text-body hover:text-ink hover:bg-canvas-soft"
                    >
                      个人资料
                    </a>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-body-sm text-body hover:text-ink hover:bg-canvas-soft"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {isMobile && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 text-ink hover:bg-canvas-soft rounded-full transition-colors touch-target"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-canvas rounded-md shadow-level-5 py-2 z-50">
                <div className="px-4 py-2 text-body-sm text-mute border-b border-hairline">
                  {user?.username}
                </div>
                <a
                  href="/profile"
                  className="block px-4 py-3 text-body-md text-body hover:text-ink hover:bg-canvas-soft touch-target"
                >
                  个人资料
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-body-md text-body hover:text-ink hover:bg-canvas-soft touch-target"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: 提交 Navbar 改造**

```bash
git add frontend/src/components/Navbar.jsx
git commit -m "feat: Navbar 添加移动端汉堡菜单支持"
```

---

## Task 8: 改造 FileList 支持网格视图

**Files:**
- Modify: `frontend/src/components/FileList.jsx`

- [ ] **Step 1: 改造 FileList 组件支持移动端网格视图**

修改 `frontend/src/components/FileList.jsx`：

```javascript
import FileItem from './FileItem';
import MobileFileCard from './MobileFileCard';
import Loading from './Loading';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function FileList({ files, onFileClick, onContextMenu, loading, isTrashView = false }) {
  const isMobile = useIsMobile();

  const formatSize = (bytes) => {
    if (bytes === 0) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 0 ? '刚刚' : minutes + ' 分钟前';
      }
      return hours + ' 小时前';
    } else if (days === 1) {
      return '昨天';
    } else if (days < 7) {
      return days + ' 天前';
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (loading) {
    return (
      <div className="bg-canvas rounded-md shadow-level-2 p-8">
        <Loading />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-canvas-soft rounded-lg p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-canvas flex items-center justify-center">
          <svg className="w-8 h-8 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-body-md-strong text-ink mb-2">暂无文件</h3>
        <p className="text-body-sm text-body">上传文件或创建文件夹开始使用</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {files.map((file) => (
          <MobileFileCard
            key={file.id}
            file={file}
            onClick={() => onFileClick(file)}
            onLongPress={(e) => onContextMenu(e, file)}
            isTrashView={isTrashView}
          />
        ))}
      </div>
    );
  }

  const folders = files.filter(f => f.is_folder);
  const docs = files.filter(f => !f.is_folder);

  return (
    <div className="bg-canvas rounded-md shadow-level-2">
      <div className="hidden grid-cols-12 gap-4 px-6 py-3 border-b border-hairline text-caption-mono text-mute uppercase tracking-wider">
        <div className="col-span-5">名称</div>
        <div className="col-span-2 text-right">大小</div>
        <div className="col-span-5 text-right">{isTrashView ? '删除时间' : '修改时间'}</div>
      </div>
      
      <div className="divide-y divide-hairline">
        {folders.length > 0 && (
          <div>
            {folders.map((folder) => (
              <FileItem
                key={folder.id}
                file={folder}
                onClick={() => onFileClick(folder)}
                onContextMenu={(e) => onContextMenu(e, folder)}
                formatSize={formatSize}
                formatDate={formatDate}
                isTrashView={isTrashView}
              />
            ))}
          </div>
        )}
        
        {docs.length > 0 && folders.length > 0 && (
          <div className="border-t border-hairline">
            <div className="px-6 py-2 text-caption-mono text-mute uppercase tracking-wider">文件</div>
          </div>
        )}
        
        {docs.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onClick={() => onFileClick(file)}
            onContextMenu={(e) => onContextMenu(e, file)}
            formatSize={formatSize}
            formatDate={formatDate}
            isTrashView={isTrashView}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 提交 FileList 改造**

```bash
git add frontend/src/components/FileList.jsx
git commit -m "feat: FileList 添加移动端网格视图支持"
```

---

## Task 9: 改造 Home 页面响应式布局

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: 改造 Home 页面支持移动端布局**

修改 `frontend/src/pages/Home.jsx`，整合所有移动端组件：

在文件顶部添加新的导入：
```javascript
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileDrawer from '../components/MobileDrawer';
import { UploadFAB } from '../components/MobileFAB';
import ActionSheet from '../components/ActionSheet';
import FileList from '../components/FileList';
import Breadcrumb from '../components/Breadcrumb';
import UploadModal from '../components/UploadModal';
import CreateFolderModal from '../components/CreateFolderModal';
import ContextMenu from '../components/ContextMenu';
import FileActionModals from '../components/FileActionModals';
import PreviewModal from '../components/PreviewModal';
import { useAuth } from '../context/AuthContext';
import { filesAPI } from '../api/files';
import { useIsMobile } from '../hooks/useMediaQuery';
```

在组件内部添加移动端状态：
```javascript
export default function Home() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [actionSheetFile, setActionSheetFile] = useState(null);
  
  // ... 保持其他现有状态
```

添加移动端 Action Sheet 处理函数：
```javascript
  const handleMobileContextMenu = (e, file) => {
    if (isMobile) {
      setActionSheetFile(file);
      setShowActionSheet(true);
    } else {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, file });
    }
  };

  const getActionSheetActions = () => {
    if (!actionSheetFile) return [];
    
    const actions = [];
    
    if (!isTrashView) {
      if (!actionSheetFile.is_folder) {
        actions.push({
          label: '预览',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ),
          onClick: () => handlePreview(actionSheetFile),
        });
        actions.push({
          label: '下载',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          ),
          onClick: () => handleDownload(actionSheetFile),
        });
      }
      actions.push({
        label: '重命名',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        onClick: () => handleRename(actionSheetFile),
      });
      actions.push({
        label: '移动到',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h6m6 10h6M3 7l6 6m0 0l6-6m-6 6V3m6 14l6-6m0 0l-6-6m6 6v12" />
          </svg>
        ),
        onClick: () => handleMove(actionSheetFile),
      });
      actions.push({
        label: '删除',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: () => handleDelete(actionSheetFile),
        destructive: true,
      });
    } else {
      actions.push({
        label: '恢复',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        onClick: () => handleRestore(actionSheetFile),
      });
      actions.push({
        label: '永久删除',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: () => handleDelete(actionSheetFile),
        destructive: true,
      });
    }
    
    return actions;
  };
```

修改 return 部分：
```javascript
  return (
    <div className="min-h-screen bg-canvas-soft">
      <Navbar 
        onUploadClick={() => setShowUpload(true)} 
        onSearch={handleSearch}
        onMenuClick={() => setShowMobileDrawer(true)}
      />

      {!isMobile && (
        <Sidebar
          onNavigate={handleNavigate}
          currentFolderId={currentFolderId}
          currentType={currentType}
          isTrashView={isTrashView}
        />
      )}

      <div className={`${isMobile ? '' : 'ml-64'}`}>
        <main className={`${isMobile ? 'px-4 py-4' : 'max-w-7xl mx-auto py-6 px-6'}`}>
          <div className="mb-4 tablet:mb-6">
            <div className="flex flex-col mobile:flex-row justify-between items-start mobile:items-center gap-3">
              <Breadcrumb path={breadcrumbPath} onNavigate={handleNavigate} />
              {!isMobile && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="flex items-center px-4 py-2 bg-canvas border border-hairline rounded-md text-body-sm-strong text-ink hover:bg-canvas-soft transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    新建文件夹
                  </button>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="btn-primary text-body-sm-strong h-9 px-4"
                  >
                    <svg className="w-4 h-4 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    上传文件
                  </button>
                </div>
              )}
            </div>
            
            {searchQuery && (
              <div className="mt-4 flex items-center text-body-sm text-body">
                <svg className="w-4 h-4 mr-2 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                搜索 "{searchQuery}" 的结果
                <button
                  onClick={() => {
                    setSearchQuery('');
                    loadFiles();
                  }}
                  className="ml-2 text-link hover:text-link-deep"
                >
                  清除
                </button>
              </div>
            )}
          </div>

          <FileList
            files={files}
            onFileClick={handleFileClick}
            onContextMenu={handleMobileContextMenu}
            loading={loading}
            isTrashView={isTrashView}
          />
        </main>
      </div>

      {isMobile && (
        <UploadFAB onClick={() => setShowUpload(true)} />
      )}

      <MobileDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        onNavigate={handleNavigate}
        currentFolderId={currentFolderId}
        currentType={currentType}
        isTrashView={isTrashView}
        onSearch={handleSearch}
      />

      <ActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title={actionSheetFile?.name}
        actions={getActionSheetActions()}
      />

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        currentFolderId={currentFolderId}
        onUploadSuccess={loadFiles}
      />

      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        currentFolderId={currentFolderId}
        onSuccess={loadFiles}
      />

      {contextMenu && !isMobile && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          onClose={() => setContextMenu(null)}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onRename={handleRename}
          onDelete={handleDelete}
          onMove={handleMove}
          onRestore={handleRestore}
          isTrashView={isTrashView}
        />
      )}

      <FileActionModals
        showRename={actionModal.showRename}
        showDelete={actionModal.showDelete}
        showMove={actionModal.showMove}
        file={selectedFile}
        folders={files}
        onClose={handleActionModalClose}
        onSuccess={handleActionSuccess}
        isPermanent={actionModal.isPermanent}
      />

      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        file={previewFile}
      />
    </div>
  );
}
```

- [ ] **Step 2: 提交 Home 页面改造**

```bash
git add frontend/src/pages/Home.jsx
git commit -m "feat: Home 页面添加移动端响应式布局"
```

---

## Task 10: 改造模态框支持移动端

**Files:**
- Modify: `frontend/src/components/UploadModal.jsx`
- Modify: `frontend/src/components/CreateFolderModal.jsx`
- Modify: `frontend/src/components/PreviewModal.jsx`

- [ ] **Step 1: 改造 UploadModal 支持移动端底部抽屉**

在 `frontend/src/components/UploadModal.jsx` 中添加移动端支持：

在文件顶部添加导入：
```javascript
import { useState, useRef, useEffect } from 'react';
import { filesAPI } from '../api/files';
import { useIsMobile } from '../hooks/useMediaQuery';
import { motion, AnimatePresence } from 'framer-motion';
```

在组件内部添加：
```javascript
export default function UploadModal({ isOpen, onClose, currentFolderId, onUploadSuccess }) {
  const isMobile = useIsMobile();
  // ... 保持其他现有代码
```

修改 return 部分，使用 AnimatePresence 和 motion：
```javascript
  if (!isOpen) return null;

  const modalContent = (
    <div className={`bg-canvas ${isMobile ? 'rounded-t-xl' : 'rounded-lg'} shadow-level-5 w-full ${isMobile ? '' : 'max-w-lg'}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
        <h2 className="text-display-sm font-semibold text-ink">上传文件</h2>
        <button
          onClick={onClose}
          className="text-mute hover:text-ink transition-colors touch-target p-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* ... 保持其余内容不变 */}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          {isMobile ? (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
            >
              {modalContent}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              {modalContent}
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
```

- [ ] **Step 2: 改造 CreateFolderModal 支持移动端**

类似地修改 `frontend/src/components/CreateFolderModal.jsx`

- [ ] **Step 3: 改造 PreviewModal 支持移动端全屏**

修改 `frontend/src/components/PreviewModal.jsx`，移动端使用全屏展示

- [ ] **Step 4: 提交模态框改造**

```bash
git add frontend/src/components/UploadModal.jsx frontend/src/components/CreateFolderModal.jsx frontend/src/components/PreviewModal.jsx
git commit -m "feat: 模态框添加移动端底部抽屉和全屏支持"
```

---

## Task 11: 测试和验证

**Files:**
- 无文件修改

- [ ] **Step 1: 启动开发服务器测试**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: 验证移动端功能**

在浏览器开发者工具中切换到移动端视口，验证：
1. 汉堡菜单正常打开/关闭
2. 文件网格视图正常显示
3. 浮动上传按钮正常工作
4. 长按显示操作菜单
5. 模态框底部抽屉正常显示

- [ ] **Step 3: 验证桌面端功能不变**

切换到桌面端视口，验证：
1. 侧边栏正常显示
2. 文件列表视图正常
3. 所有功能正常工作

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "feat: 完成移动端响应式支持"
```

---

## 验收清单

- [ ] 移动端汉堡菜单正常工作
- [ ] 移动端抽屉导航正常工作
- [ ] 移动端文件网格视图正常显示
- [ ] 移动端浮动上传按钮正常工作
- [ ] 移动端长按上下文菜单正常工作
- [ ] 移动端模态框底部抽屉正常显示
- [ ] 所有触摸区域 ≥ 44x44px
- [ ] 桌面端功能完全正常
- [ ] 平板端布局正常
- [ ] 动画过渡流畅
