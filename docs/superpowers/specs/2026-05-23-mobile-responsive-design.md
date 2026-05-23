# 移动端响应式支持设计规范

## 概述

为文件传输站项目添加完整的移动端响应式支持，遵循 Vercel 设计系统的移动端规范，采用渐进式响应式改造方案。

## 设计目标

1. **响应式 Web 应用**：保持单一代码库，通过响应式设计适配移动端
2. **完整功能体验**：文件管理、预览、搜索、用户认证等所有功能在移动端可用
3. **原生交互体验**：手势滑动、长按、下拉刷新等移动端原生交互方式
4. **Vercel 设计规范**：完全遵循 Vercel 设计系统的颜色、排版、间距规范

## 响应式断点策略

遵循 Vercel 设计系统断点：

| 断点名称 | 宽度范围 | 布局特征 |
|---------|---------|---------|
| Mobile | < 600px | 单列布局，汉堡菜单，卡片网格 |
| Tablet | 600px - 959px | 双列布局，侧边栏可折叠 |
| Desktop | ≥ 960px | 三列布局，固定侧边栏（现有） |

## 组件设计

### 1. 导航栏 (Navbar)

#### 桌面端（≥ 960px）- 保持现有
- Logo + 搜索框 + 上传按钮 + 用户菜单
- 高度 64px，固定顶部

#### 移动端（< 600px）
- 左侧：汉堡菜单按钮
- 中间：Logo
- 右侧：用户头像
- 搜索框移至抽屉菜单内
- 上传按钮改为右下角浮动 FAB

#### 平板端（600px - 959px）
- 保持桌面端布局
- 搜索框宽度自适应收缩

### 2. 侧边栏 (Sidebar) → 移动端抽屉

#### 桌面端（≥ 960px）- 保持现有
- 固定左侧，宽度 256px
- 显示快速访问和我的文件夹

#### 移动端（< 600px）
- 默认隐藏
- 通过汉堡菜单打开
- 全屏抽屉覆盖（带遮罩层）
- 包含内容：
  - 顶部搜索框
  - 快速访问菜单
  - 我的文件夹
  - 分隔线
  - 个人资料链接
  - 退出登录按钮
- 点击外部或按 ESC 关闭

#### 平板端（600px - 959px）
- 可折叠侧边栏
- 默认展开，可点击按钮收起为图标模式

### 3. 文件列表 (FileList)

#### 桌面端（≥ 960px）- 保持现有
- 列表视图
- 表头：名称、大小、修改时间
- 文件夹优先排序

#### 移动端（< 600px）
- 2列网格卡片视图
- 卡片内容：
  - 文件图标（居中，48x48px）
  - 文件名（最多2行，溢出省略）
  - 文件大小或项目数
- 卡片尺寸：约 150x120px
- 卡片间距：12px
- 长按显示上下文菜单

#### 平板端（600px - 959px）
- 3列网格卡片视图
- 卡片略大于移动端

### 4. 文件项 (FileItem)

#### 桌面端 - 保持现有列表项
- 高度 48px
- 显示图标、名称、大小、时间

#### 移动端卡片模式
- 卡片最小高度 100px
- 图标区域 48x48px
- 触摸区域最小 44x44px
- 点击进入文件夹或预览
- 长按显示操作菜单

### 5. 浮动操作按钮 (FAB) - 新增

仅移动端显示：
- 位置：右下角，距离底部 80px，距离右边 16px
- 尺寸：56x56px 圆形
- 颜色：primary (#171717)
- 图标：上传图标
- 点击打开上传模态框
- 带阴影 level-4

### 6. 模态框优化

#### 上传模态框 (UploadModal)
- 桌面端：居中弹窗，宽度 480px
- 移动端：底部抽屉，全宽，圆角顶部 16px

#### 预览模态框 (PreviewModal)
- 桌面端：居中弹窗，最大宽度 90vw
- 移动端：全屏展示，顶部关闭按钮

#### 创建文件夹模态框 (CreateFolderModal)
- 桌面端：居中弹窗，宽度 400px
- 移动端：底部抽屉，全宽

#### 操作确认模态框
- 桌面端：居中弹窗
- 移动端：底部 Action Sheet

### 7. 上下文菜单 (ContextMenu)

#### 桌面端 - 保持现有
- 右键触发
- 浮动菜单，宽度 180px

#### 移动端
- 长按触发
- 底部 Action Sheet
- 全宽，圆角顶部 16px
- 操作项高度 56px

## 交互设计

### 1. 手势交互

| 手势 | 操作 | 适用场景 |
|-----|------|---------|
| 点击 | 进入文件夹/预览文件 | 文件卡片 |
| 长按 | 显示上下文菜单 | 文件卡片 |
| 下拉 | 刷新文件列表 | 文件列表区域 |
| 左滑 | 快捷删除（可选） | 文件卡片 |

### 2. 触摸区域规范

遵循 WCAG 2.1 AAA 标准：
- 所有可点击元素最小触摸区域：44x44px
- 文件卡片最小高度：100px
- 列表项最小高度：56px（移动端）
- 按钮最小高度：44px
- 菜单项最小高度：48px

### 3. 动画过渡

使用 Framer Motion 实现：
- 抽屉滑入/滑出：translateX，duration 300ms
- 模态框淡入：opacity + scale，duration 200ms
- 卡片点击反馈：scale 0.98，duration 100ms
- 下拉刷新：translateY，弹性动画

## 技术实现

### 1. 新增依赖

```json
{
  "@use-gesture/react": "^10.3.0",
  "framer-motion": "^10.16.0"
}
```

### 2. Tailwind 配置扩展

```javascript
// tailwind.config.js
theme: {
  extend: {
    screens: {
      'mobile': { 'max': '599px' },
      'tablet': { 'min': '600px', 'max': '959px' },
      'desktop': { 'min': '960px' },
    },
  }
}
```

### 3. 新增组件

| 组件名 | 路径 | 功能 |
|-------|------|------|
| MobileDrawer | components/MobileDrawer.jsx | 移动端抽屉导航 |
| MobileFileCard | components/MobileFileCard.jsx | 移动端文件卡片 |
| MobileFAB | components/MobileFAB.jsx | 浮动操作按钮 |
| ActionSheet | components/ActionSheet.jsx | 底部操作面板 |
| PullToRefresh | components/PullToRefresh.jsx | 下拉刷新容器 |

### 4. 改造组件

| 组件名 | 改造内容 |
|-------|---------|
| Navbar | 添加汉堡菜单按钮，响应式布局 |
| Sidebar | 支持抽屉模式，平板折叠模式 |
| FileList | 支持网格视图模式 |
| FileItem | 支持卡片渲染模式 |
| UploadModal | 支持底部抽屉模式 |
| PreviewModal | 支持全屏模式 |
| CreateFolderModal | 支持底部抽屉模式 |
| ContextMenu | 支持 Action Sheet 模式 |
| FileActionModals | 支持移动端样式 |

### 5. CSS 工具类扩展

```css
/* 移动端触摸区域 */
@layer utilities {
  .touch-target {
    min-width: 44px;
    min-height: 44px;
  }
  
  /* 移动端底部抽屉 */
  .bottom-drawer {
    @apply fixed bottom-0 left-0 right-0 bg-canvas rounded-t-xl shadow-level-5;
  }
}
```

## 设计规范遵循

### 颜色
完全使用现有 Vercel 设计系统颜色变量，不引入新颜色。

### 排版
- 标题：display-sm (20px) 用于移动端页面标题
- 正文：body-md (16px) 和 body-sm (14px)
- 说明文字：caption (12px)

### 间距
遵循 4px 基础单位：
- 卡片间距：12px (spacing-sm)
- 页面内边距：16px (spacing-md)
- 组件间距：8px (spacing-xs)

### 圆角
- 卡片：rounded-md (8px)
- 按钮：rounded-pill (100px)
- 抽屉顶部：rounded-t-xl (16px)
- FAB：rounded-full

### 阴影
- 卡片：shadow-level-2
- FAB：shadow-level-4
- 抽屉/模态框：shadow-level-5

## 实现计划

### Phase 1: 基础响应式布局
1. 扩展 Tailwind 响应式断点配置
2. 改造 Navbar 支持移动端汉堡菜单
3. 创建 MobileDrawer 组件
4. 改造 Sidebar 支持抽屉模式
5. 创建 MobileFAB 组件

### Phase 2: 文件列表响应式
1. 创建 MobileFileCard 组件
2. 改造 FileList 支持网格视图
3. 改造 FileItem 支持卡片模式
4. 调整 Home 页面布局响应式

### Phase 3: 交互增强
1. 安装手势交互库
2. 实现 PullToRefresh 组件
3. 实现长按上下文菜单
4. 优化所有触摸区域

### Phase 4: 模态框优化
1. 创建 ActionSheet 组件
2. 改造所有模态框支持移动端
3. 优化预览模态框全屏体验
4. 测试所有交互流程

## 验收标准

1. **功能完整性**
   - 所有桌面端功能在移动端可用
   - 文件上传、下载、预览正常工作
   - 搜索、筛选功能正常工作

2. **交互体验**
   - 触摸区域不小于 44x44px
   - 手势交互流畅自然
   - 动画过渡平滑

3. **视觉一致性**
   - 遵循 Vercel 设计规范
   - 颜色、排版、间距一致
   - 桌面端外观不变

4. **性能要求**
   - 移动端首屏加载 < 3s
   - 交互响应 < 100ms
   - 无明显卡顿

## 风险与缓解

| 风险 | 缓解措施 |
|-----|---------|
| 手势冲突 | 合理设置手势触发阈值，避免误触 |
| 性能下降 | 使用 CSS transform 动画，避免重排 |
| 兼容性问题 | 测试主流移动浏览器，提供降级方案 |
| 现有功能影响 | 渐进式改造，保持桌面端不变 |
