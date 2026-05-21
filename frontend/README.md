# CloudFile - 私有云盘文件管理器

一个基于 FastAPI + React 的私有云盘文件管理器。

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT Token 认证
- ✅ 文件夹管理（创建、删除、移动）
- ✅ 文件上传（支持拖拽）
- ✅ 文件下载
- ✅ 文件重命名
- ✅ 文件搜索
- ✅ 响应式设计

## 技术栈

**后端**
- Python 3.10+
- FastAPI
- SQLAlchemy
- MySQL
- JWT Authentication

**前端**
- React 18
- Vite
- Tailwind CSS
- Axios
- React Router

## 快速开始

### 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 前端

```bash
cd frontend
npm install
npm run dev
```

## 项目结构

```
├── backend/
│   ├── app/
│   │   ├── models/      # 数据库模型
│   │   ├── schemas/     # Pydantic 模型
│   │   ├── routers/     # API 路由
│   │   ├── services/    # 业务逻辑
│   │   └── utils/       # 工具函数
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/         # API 调用
│   │   ├── components/   # React 组件
│   │   ├── pages/       # 页面
│   │   ├── context/     # React Context
│   │   └── hooks/       # 自定义 Hooks
│   └── package.json
└── docs/                # 设计文档
```

## License

MIT
