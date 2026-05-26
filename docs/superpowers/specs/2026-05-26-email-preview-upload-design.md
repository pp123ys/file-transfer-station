# 邮箱验证 · 文件预览增强 · 上传安全 设计文档

> 日期：2026-05-26
> 状态：草稿

## 一、需求概述

本次迭代包含以下四个功能：

1. **邮箱验证** - 新用户注册必须填写邮箱，支持验证码验证，防止重复注册
2. **文件预览增强** - 支持 PDF、Word、文本、Markdown、音频、视频文件预览
3. **图片缩略图** - 文件列表中图片直接显示缩略图
4. **上传安全拦截** - 不支持的文件类型在上传前弹窗提醒

---

## 二、邮箱验证功能

### 2.1 功能描述

#### 2.1.1 新用户注册流程

```
用户输入邮箱 → 发送验证码 → 输入验证码 → 注册成功
```

- 邮箱必填，且必须与数据库已有邮箱进行唯一性校验
- 验证码有效期：10 分钟
- 同一邮箱 10 分钟内只能请求 3 次验证码

#### 2.1.2 已有用户处理

- 保持现有用户数据不变
- 用户登录时检测邮箱为空：显示补全邮箱提示（不强制）
- 用户可在个人资料页补全邮箱

### 2.2 数据库设计

#### 2.2.1 User 表修改

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| email | VARCHAR(255) | UNIQUE, NULL | 用户邮箱，唯一约束 |
| email_verified | BOOLEAN | DEFAULT FALSE | 邮箱是否已验证 |
| email_verified_at | DATETIME | NULL | 验证时间 |

#### 2.2.2 新增 email_verification_codes 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PRIMARY KEY | 主键 |
| email | VARCHAR(255) | NOT NULL | 邮箱地址 |
| code | VARCHAR(6) | NOT NULL | 6位验证码 |
| expires_at | DATETIME | NOT NULL | 过期时间 |
| created_at | DATETIME | DEFAULT NOW | 创建时间 |

### 2.3 API 设计

#### 2.3.1 发送验证码

```
POST /api/auth/send-verification-code
Body: { "email": "user@example.com" }
Response: { "success": true, "message": "验证码已发送" }
```

- 校验邮箱格式
- 校验邮箱是否已被注册
- 检查发送频率（10分钟内最多3次）
- 生成 6 位数字验证码，10 分钟有效
- 存储验证码到数据库
- 预留邮件发送接口（暂不实现真实发送）

#### 2.3.2 注册接口修改

```
POST /api/auth/register
Body: {
  "username": "用户名",
  "password": "密码",
  "email": "user@example.com",
  "verification_code": "123456"
}
Response: { "success": true, "token": "..." }
```

- 校验邮箱格式
- 校验邮箱唯一性
- 校验验证码正确性
- 校验验证码未过期
- 删除已使用的验证码
- 注册成功后标记邮箱已验证

#### 2.3.3 登录接口修改

```
POST /api/auth/login
Body: { "username": "...", "password": "..." }
Response: {
  "token": "...",
  "user": { ..., "email": "...", "email_missing": true/false }
}
```

- 返回 `email_missing` 字段标识用户是否需要补全邮箱

#### 2.3.4 补全邮箱

```
PUT /api/auth/complete-email
Body: {
  "email": "user@example.com",
  "verification_code": "123456"
}
Headers: { "Authorization": "Bearer ..." }
```

- 已登录用户补全邮箱
- 同样需要验证码验证

### 2.4 SMTP 配置管理

#### 2.4.1 系统配置表新增字段

在 system_configs 表中新增：

| key | value | description |
|-----|-------|-------------|
| smtp_host | smtp.example.com | SMTP 服务器地址 |
| smtp_port | 587 | SMTP 端口 |
| smtp_username | example@domain.com | 发送邮箱账号 |
| smtp_password | ********** | 发送邮箱密码（加密存储） |
| smtp_from_email | noreply@domain.com | 发件人邮箱 |
| smtp_from_name | File Transfer Station | 发件人名称 |
| email_enabled | false | 是否启用真实邮件发送 |

#### 2.4.2 管理员配置页面

在 Admin Settings 页面新增邮件配置区块：
- SMTP 服务器地址输入框
- 端口号输入框
- 发送邮箱账号输入框
- 发送邮箱密码输入框（密码类型，显示/隐藏切换）
- 发送测试邮件按钮
- 保存按钮

#### 2.4.3 邮件发送服务

```python
# backend/app/services/email.py

class EmailService:
    def send_verification_code(self, to_email: str, code: str) -> bool:
        """
        发送验证码邮件
        - 如果 email_enabled 为 false：仅记录日志，不实际发送
        - 如果 email_enabled 为 true：调用真实 SMTP 发送
        """
```

- 预留接口，支持后续接入真实 SMTP
- 开发环境下可关闭真实发送，仅日志记录

---

## 三、文件预览增强

### 3.1 支持的文件类型

| 类型 | 格式 | 前端组件 | 说明 |
|------|------|----------|------|
| 图片 | jpg, jpeg, png, gif, webp, svg | 原生 `<img>` | 支持缩略图 |
| PDF | pdf | PDF.js | 分页渲染 |
| Word | doc, docx | Mammoth.js | 转换为 HTML |
| 文本 | txt, md, json, xml, html, css, js | 原生 `<pre>` | 代码高亮可选 |
| 音频 | mp3, wav, ogg, m4a | 原生 `<audio>` | 带播放控件 |
| 视频 | mp4, webm, avi | 原生 `<video>` | 带播放控件 |

### 3.2 前端组件设计

#### 3.2.1 PreviewModal 增强

```jsx
// PreviewModal 组件重构
function PreviewModal({ file, onClose }) {
  const previewContent = {
    image: <ImagePreview file={file} />,
    pdf: <PDFPreview file={file} />,
    document: <DocumentPreview file={file} />,
    text: <TextPreview file={file} />,
    audio: <AudioPreview file={file} />,
    video: <VideoPreview file={file} />,
    unsupported: <UnsupportedPreview file={file} />
  };

  return previewContent[getPreviewType(file)];
}
```

#### 3.2.2 预览组件列表

| 组件 | 功能 |
|------|------|
| ImagePreview | 图片直接展示，支持缩略图 |
| PDFPreview | PDF 分页渲染，支持缩放 |
| DocumentPreview | Word 文档渲染为 HTML |
| TextPreview | 纯文本/代码展示，可选语法高亮 |
| AudioPreview | 音频播放器，支持播放/暂停、音量控制 |
| VideoPreview | 视频播放器，支持播放/暂停、全屏 |
| UnsupportedPreview | 不支持的文件类型提示下载 |

### 3.3 后端接口

#### 3.3.1 文件下载/预览接口

已有 `/api/files/{file_id}/download` 接口保持不变，前端根据文件类型决定展示方式。

#### 3.3.2 文本文件内容接口（可选优化）

```
GET /api/files/{file_id}/content
Response: { "content": "文件文本内容" }
```

- 仅适用于小文件（< 1MB）
- 用于文本预览，避免大文件加载

---

## 四、图片缩略图

### 4.1 功能描述

在文件列表中，图片文件直接显示缩略图，而不是文件图标。

### 4.2 实现方案

#### 4.2.1 方案 A：后端生成缩略图（推荐）

- 后端在上传图片时生成缩略图（低分辨率版本）
- 缩略图存储在单独目录：`storage/thumbnails/{user_id}/{file_id}_thumb.{ext}`
- 文件列表 API 返回缩略图 URL

#### 4.2.2 方案 B：前端 base64 内联

- 前端请求文件时获取 base64 编码的缩略图
- 适用于小规模用户，性能较差

### 4.3 数据库设计

#### 4.3.1 File 表新增字段

| 字段 | 类型 | 说明 |
|------|------|------|
| thumbnail_path | VARCHAR(500) | 缩略图相对路径 |

#### 4.3.2 文件列表响应

```json
{
  "files": [
    {
      "id": 1,
      "name": "photo.jpg",
      "type": "image",
      "thumbnail_url": "/api/files/1/thumbnail",
      "url": "/api/files/1/download"
    }
  ]
}
```

### 4.4 前端组件

#### 4.4.1 ImageThumbnail 组件

```jsx
function ImageThumbnail({ file, onClick }) {
  return (
    <div className="relative">
      <img
        src={file.thumbnail_url}
        alt={file.name}
        className="w-full h-full object-cover rounded"
        loading="lazy"
      />
    </div>
  );
}
```

#### 4.4.2 FileItem 组件修改

- 图片文件：使用 ImageThumbnail
- 其他文件：保持现有图标展示

---

## 五、上传安全拦截

### 5.1 功能描述

用户在上传文件时，系统检测文件类型，不支持的文件类型弹窗提醒并阻止上传。

### 5.2 支持的文件类型白名单

```
允许的文件类型：
- 图片：image/jpeg, image/png, image/gif, image/webp, image/svg+xml
- 文档：application/pdf, application/msword,
        application/vnd.openxmlformats-officedocument.wordprocessingml.document,
        text/plain, text/markdown
- 音视频：audio/mpeg, audio/wav, audio/ogg, audio/mp4,
          video/mp4, video/webm, video/avi
- 其他：application/json, application/xml

禁止的文件类型：
- 可执行文件：application/x-executable, application/x-msdownload
- 脚本：text/x-python, text/x-java, application/x-sh
- 压缩包（可选）：application/zip, application/x-rar-compressed（根据需求）
```

### 5.3 实现位置

#### 5.3.1 前端拦截（用户体验）

在 `UploadModal` 组件中：
- 用户选择文件后立即检测文件类型
- 不支持的文件显示错误提示，文件不上传到服务器
- 提示文案："不支持的文件类型 '{filename}'，请选择图片、文档、音频或视频文件"

#### 5.3.2 后端拦截（安全防护）

在文件上传接口中：
- 再次校验文件 MIME 类型
- 检查文件扩展名
- 禁止的可执行文件返回 400 错误

### 5.4 前端提示组件

```jsx
function UploadErrorAlert({ filename, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-red-600 mb-2">上传失败</h3>
        <p className="text-gray-600">
          不支持的文件类型 <strong>{filename}</strong>
        </p>
        <p className="text-gray-500 text-sm mt-2">
          请选择图片、文档、音频或视频文件
        </p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          知道了
        </button>
      </div>
    </div>
  );
}
```

---

## 六、UI 设计规范（Vercel Design System）

### 6.1 设计原则

本项目遵循 Vercel 设计系统，以简洁、专业、开发者友好的风格为核心：

- **黑白为主**：以深黑 `#171717` 作为主要强调色，白色作为卡片和输入框背景
- **留白呼吸**：大间距让内容有呼吸感，组内元素紧凑
- **微妙阴影**：多层叠加的细微阴影，而非单一大阴影
- **单行标题**：句子大小写（Sentence-case），标题以句号结尾

### 6.2 色彩系统

| Token | 色值 | 用途 |
|-------|------|------|
| `{colors.primary}` | `#171717` | 主要 CTA 按钮、标题文本 |
| `{colors.on-primary}` | `#ffffff` | 深色表面上的白色文本 |
| `{colors.ink}` | `#171717` | 浅色表面上的标题和正文 |
| `{colors.body}` | `#4d4d4d` | 次要文本、导航链接 |
| `{colors.mute}` | `#888888` | 占位符文本、说明文字 |
| `{colors.canvas}` | `#ffffff` | 卡片、模态框背景 |
| `{colors.canvas-soft}` | `#fafafa` | 页面默认背景 |
| `{colors.hairline}` | `#ebebeb` | 分隔线、输入框边框 |
| `{colors.link}` | `#0070f3` | 链接颜色、成功状态 |
| `{colors.error}` | `#ee0000` | 表单验证错误 |
| `{colors.error-soft}` | `#f7d4d6` | 错误状态背景 |
| `{colors.warning}` | `#f5a623` | 警告状态 |
| `{colors.warning-soft}` | `#ffefcf` | 警告状态背景 |

### 6.3 排版系统

| Token | 字号 | 字重 | 行高 | 字间距 | 用途 |
|-------|------|------|------|--------|------|
| `{typography.display-xl}` | 48px | 600 | 48px | -2.4px | 英雄标题 |
| `{typography.display-lg}` | 32px | 600 | 40px | -1.28px | 区块标题 |
| `{typography.display-md}` | 24px | 600 | 32px | -0.96px | 卡片标题 |
| `{typography.body-lg}` | 18px | 400 | 28px | 0 | 引导段落 |
| `{typography.body-md}` | 16px | 400 | 24px | 0 | 正文 |
| `{typography.body-sm}` | 14px | 400 | 20px | -0.28px | 次要文本 |
| `{typography.caption}` | 12px | 400 | 16px | 0 | 标签说明 |
| `{typography.button-lg}` | 16px | 500 | 24px | 0 | 按钮标签 |

### 6.4 间距系统

基础单位：4px

| Token | 值 | 用途 |
|-------|------|------|
| `{spacing.xxs}` | 4px | 紧凑间距 |
| `{spacing.xs}` | 8px | 小间距 |
| `{spacing.sm}` | 12px | 按钮内间距 |
| `{spacing.md}` | 16px | 默认间距 |
| `{spacing.lg}` | 24px | 卡片内间距 |
| `{spacing.xl}` | 32px | 大间距 |
| `{spacing.2xl}` | 40px | 区块间距 |

### 6.5 圆角系统

| Token | 值 | 用途 |
|-------|------|------|
| `{rounded.sm}` | 6px | 按钮、输入框 |
| `{rounded.md}` | 8px | 卡片 |
| `{rounded.lg}` | 12px | 大卡片 |
| `{rounded.pill}` | 100px | 营销 CTA 按钮 |
| `{rounded.full}` | 9999px | 圆形图标按钮 |

### 6.6 组件样式

#### 6.6.1 按钮

**主要按钮（button-primary）**
```css
background-color: #171717;
color: #ffffff;
border-radius: 100px; /* rounded.pill */
padding: 0 12px; /* spacing.sm */
height: 48px;
font-size: 16px;
font-weight: 500;
```

**次要按钮（button-secondary）**
```css
background-color: #ffffff;
color: #171717;
border: 1px solid #ebebeb; /* hairline */
border-radius: 100px;
padding: 0 12px;
height: 48px;
font-size: 16px;
font-weight: 500;
```

**小尺寸按钮**
```css
height: 32px;
font-size: 14px;
border-radius: 100px;
```

#### 6.6.2 输入框

**表单输入框（form-input）**
```css
background-color: #ffffff;
color: #171717;
border: 1px solid #ebebeb; /* hairline */
border-radius: 6px; /* rounded.sm */
padding: 0 12px;
height: 40px;
font-size: 14px;
```

**大尺寸输入框**
```css
height: 48px;
font-size: 16px;
```

#### 6.6.3 卡片

**营销卡片**
```css
background-color: #ffffff;
border-radius: 8px; /* rounded.md */
padding: 24px; /* spacing.lg */
/* 阴影：多层叠加 */
box-shadow:
  0 1px 1px rgba(0, 0, 0, 0.03),
  0 2px 2px rgba(0, 0, 0, 0.04);
```

**模态框**
```css
background-color: #ffffff;
border-radius: 12px; /* rounded.lg */
padding: 32px; /* spacing.xl */
/* 阴影：最高级 */
box-shadow:
  0 1px 1px rgba(0, 0, 0, 0.03),
  0 8px 16px rgba(0, 0, 0, 0.05),
  0 24px 32px rgba(0, 0, 0, 0.06);
```

#### 6.6.4 错误提示

**错误状态输入框**
```css
border-color: #ee0000; /* error */
background-color: #f7d4d6; /* error-soft */
```

**警告状态**
```css
background-color: #ffefcf; /* warning-soft */
color: #ab570a; /* warning-deep */
```

#### 6.6.5 Toast 通知

```css
background-color: #ffffff;
border-radius: 8px;
padding: 12px 16px;
font-size: 14px;
/* 阴影：中等 */
box-shadow:
  0 2px 2px rgba(0, 0, 0, 0.04),
  0 8px 8px rgba(0, 0, 0, 0.04);
```

### 6.7 阴影层级

| 层级 | 样式 | 用途 |
|------|------|------|
| Level 1 | 1px inset border | 默认卡片边框 |
| Level 2 | 1px border + 微阴影 | 轻度提升卡片 |
| Level 3 | 1px border + 中阴影 | 功能卡片 |
| Level 4 | 1px border + 强阴影 | 定价卡片 |
| Level 5 | 1px border + 模态阴影 | 模态框、下拉菜单 |

---

## 七、技术架构

### 7.1 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18 | 现有技术栈 |
| 样式 | Tailwind CSS + Vercel 主题 | 现有技术栈 + 设计系统 |
| PDF 渲染 | react-pdf | PDF.js 的 React 封装 |
| Word 渲染 | mammoth | 将 docx 转换为 HTML |
| 后端框架 | FastAPI | 现有技术栈 |
| 邮件发送 | aiosmtplib | 异步 SMTP 客户端 |
| 缩略图生成 | Pillow | Python 图片处理库 |

### 7.2 Tailwind 配置扩展

为支持 Vercel 设计系统，需要扩展现有 Tailwind 配置：

```js
// tailwind.config.js 扩展
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#171717',
        'on-primary': '#ffffff',
        ink: '#171717',
        body: '#4d4d4d',
        mute: '#888888',
        canvas: '#ffffff',
        'canvas-soft': '#fafafa',
        hairline: '#ebebeb',
        link: '#0070f3',
        error: '#ee0000',
        'error-soft': '#f7d4d6',
        warning: '#f5a623',
        'warning-soft': '#ffefcf',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        pill: '100px',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      boxShadow: {
        'card': '0 1px 1px rgba(0, 0, 0, 0.03), 0 2px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 2px 2px rgba(0, 0, 0, 0.04), 0 8px 8px rgba(0, 0, 0, 0.04)',
        'modal': '0 1px 1px rgba(0, 0, 0, 0.03), 0 8px 16px rgba(0, 0, 0, 0.05), 0 24px 32px rgba(0, 0, 0, 0.06)',
      },
      letterSpacing: {
        'tight': '-0.028px',
        'tighter': '-0.056px',
        'tightest': '-0.06px',
      },
    },
  },
}
```

### 7.3 项目结构

```
backend/
├── app/
│   ├── models/
│   │   ├── user.py           # User 模型修改
│   │   └── email_code.py     # 新增：邮箱验证码模型
│   ├── routers/
│   │   ├── auth.py           # 注册接口修改
│   │   ├── admin_settings.py # SMTP 配置管理
│   │   └── email.py          # 新增：验证码发送接口
│   ├── services/
│   │   ├── email.py          # 新增：邮件发送服务
│   │   └── thumbnail.py      # 新增：缩略图生成服务
│   └── schemas/
│       └── email.py          # 新增：邮箱相关 Schema

frontend/
└── src/
    ├── components/
    │   ├── PreviewModal/
    │   │   ├── index.jsx
    │   │   ├── ImagePreview.jsx
    │   │   ├── PDFPreview.jsx
    │   │   ├── DocumentPreview.jsx
    │   │   ├── TextPreview.jsx
    │   │   ├── AudioPreview.jsx
    │   │   ├── VideoPreview.jsx
    │   │   └── UnsupportedPreview.jsx
    │   ├── ImageThumbnail.jsx
    │   └── UploadErrorAlert.jsx
    ├── pages/
    │   ├── Register.jsx       # 修改：添加验证码流程
    │   └── Profile.jsx        # 修改：邮箱补全功能
    └── admin/
        └── pages/
            └── Settings.jsx   # 修改：SMTP 配置区块
```

---

## 八、API 完整列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/send-verification-code | 发送验证码 |
| POST | /api/auth/register | 注册（含验证码校验） |
| POST | /api/auth/login | 登录（返回 email_missing） |
| PUT | /api/auth/complete-email | 补全邮箱 |
| GET | /api/files/{id}/thumbnail | 获取缩略图 |
| GET | /api/admin/settings/email | 获取邮件配置 |
| PUT | /api/admin/settings/email | 更新邮件配置 |
| POST | /api/admin/settings/test-email | 发送测试邮件 |

---

## 九、配置项

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| EMAIL_VERIFICATION_EXPIRE_MINUTES | 验证码有效期 | 10 |
| EMAIL_MAX_SEND_PER_MINUTE | 每邮箱每10分钟最大发送次数 | 3 |
| EMAIL_ENABLED | 是否启用真实邮件发送 | false |
| THUMBNAIL_MAX_WIDTH | 缩略图最大宽度 | 200 |
| THUMBNAIL_MAX_HEIGHT | 缩略图最大高度 | 200 |
| ALLOWED_FILE_TYPES | 允许的文件类型列表 | 见 5.2 节 |
| BLOCKED_EXTENSIONS | 禁止的文件扩展名 | exe, bat, sh, cmd |

---

## 十、错误处理

| 错误码 | 场景 | 响应消息 |
|--------|------|----------|
| 400 | 邮箱格式错误 | 邮箱格式不正确 |
| 400 | 不支持的文件类型 | 不支持的文件类型 |
| 409 | 邮箱已被注册 | 该邮箱已被注册 |
| 410 | 验证码已过期 | 验证码已过期，请重新发送 |
| 429 | 验证码发送过于频繁 | 请稍后再试 |
| 500 | 邮件发送失败 | 验证码发送失败，请稍后重试 |

---

## 十一、待确认事项

- [ ] SMTP 配置由管理员在后台设置
- [ ] 邮件发送预留接口，email_enabled 控制开关
- [ ] 开发环境下可关闭真实发送，仅日志记录
- [ ] 缩略图方案采用后端生成方式

---

## 十二、后续扩展

1. **真实邮件发送接入** - 配置 SMTP 后启用
2. **邮件模板美化** - HTML 模板
3. **更多文件类型支持** - Excel、PPT 等
4. **文件分享链接** - 生成可分享的下载链接
5. **文件版本历史** - 上传新版本保留历史记录
