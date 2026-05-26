import sys
import os
sys.path.append('.')

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal
from app.models.admin import Admin
from app.utils.admin_security import get_password_hash

def create_default_admin():
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.username == "admin").first()
        if existing:
            print("管理员账户已存在")
            return
        
        password = os.getenv('ADMIN_DEFAULT_PASSWORD', 'admin123')
        
        admin = Admin(
            username="admin",
            password_hash=get_password_hash(password),
            email="admin@example.com",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("✅ 默认管理员账户创建成功")
        print(f"   用户名: admin")
        print(f"   密码: {password}")
        print()
        print("⚠️  安全提示:")
        print("   - 请在生产环境中修改默认密码")
        print("   - 设置环境变量 ADMIN_DEFAULT_PASSWORD 来自定义密码")
        print("   - 建议首次登录后立即修改密码")
    finally:
        db.close()

if __name__ == "__main__":
    create_default_admin()
