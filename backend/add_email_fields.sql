-- 为 User 表添加邮箱验证相关字段
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at DATETIME;

-- 创建邮箱验证码表
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 为 File 表添加缩略图路径字段
ALTER TABLE files ADD COLUMN thumbnail_path VARCHAR(500);
