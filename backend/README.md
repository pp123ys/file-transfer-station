CREATE DATABASE filemanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;CREATE DATABASE filemanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;# CloudFile Backend

## 环境要求

- Python 3.10+
- MySQL 5.7+

## 安装

```bash
pip install -r requirements.txt
```

## 配置

在项目根目录创建 `.env` 文件：

```env
DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/filemanager
SECRET_KEY=your-secret-key-change-in-production
```

## 运行

```bash
uvicorn app.main:app --reload
```

API 文档地址：http://localhost:8000/docs

## 数据库

首次运行会自动创建数据库表。

如需手动初始化：

```python
from app.database import engine
from app.models import user, file

user.Base.metadata.create_all(bind=engine)
file.Base.metadata.create_all(bind=engine)
```
