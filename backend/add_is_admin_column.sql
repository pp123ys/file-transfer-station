-- 为 users 表添加 is_admin 字段
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE AFTER email;

-- 创建索引以提高查询性能
CREATE INDEX idx_users_is_admin ON users(is_admin);
