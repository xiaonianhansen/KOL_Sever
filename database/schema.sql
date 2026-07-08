-- ========================================
-- 海外达人录入系统 - 数据库建表脚本
-- 数据库: MySQL
-- 字符集: utf8mb4 (支持 emoji 和多语言)
-- ========================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS kol_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE kol_db;

-- ========================================
-- 用户表 (users)
-- 用途: 存储系统登录用户信息
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID，主键自增',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '登录用户名，唯一',
  password VARCHAR(255) NOT NULL COMMENT '加密后的密码',
  name VARCHAR(100) NOT NULL COMMENT '用户真实姓名',
  role VARCHAR(20) DEFAULT 'user' COMMENT '用户角色: admin(管理员)/operator(运营人员)',
  view_scope JSON DEFAULT NULL COMMENT '可查看范围(运营人员): null=仅自己, 数组=可查看指定运营人员的达人',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='系统用户表';

-- ========================================
-- 海外达人表 (kols)
-- 用途: 存储海外达人(KOL)信息
-- ========================================
CREATE TABLE IF NOT EXISTS kols (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT '达人ID，主键自增',
  name VARCHAR(100) NOT NULL COMMENT '达人姓名/昵称',
  platform VARCHAR(50) NOT NULL COMMENT '社交平台: Instagram/YouTube/TikTok/Twitter/Facebook/其他',
  followers BIGINT NOT NULL DEFAULT 0 COMMENT '粉丝数量',
  category VARCHAR(50) NOT NULL COMMENT '内容类别: 时尚/美妆/游戏/美食/旅行/健身/科技/其他',
  country VARCHAR(50) NOT NULL COMMENT '所在国家/地区',
  email VARCHAR(100) NOT NULL COMMENT '联系邮箱',
  contact_status VARCHAR(20) DEFAULT '待联系' COMMENT '联系状态: 待联系/已联系/合作中/已拒绝',
  notes TEXT COMMENT '备注信息',
  created_by INT NOT NULL COMMENT '录入人ID，关联users表',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_platform (platform) COMMENT '平台索引，加速按平台筛选',
  INDEX idx_category (category) COMMENT '类别索引，加速按类别筛选',
  INDEX idx_country (country) COMMENT '国家索引，加速按国家筛选',
  INDEX idx_contact_status (contact_status) COMMENT '联系状态索引，加速按状态筛选',
  INDEX idx_created_by (created_by) COMMENT '录入人索引，加速按权限筛选',
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) COMMENT='海外达人信息表';

-- ========================================
-- 初始化数据
-- ========================================

-- 插入默认管理员账号 (密码: admin123)
-- 注意: 实际使用时请使用 bcrypt 生成密码哈希
INSERT INTO users (username, password, name, role) VALUES 
('admin', 'admin123', '管理员', 'admin');

-- 插入示例运营人员账号 (密码: operator123)
INSERT INTO users (username, password, name, role) VALUES 
('operator1', 'operator123', '运营人员A', 'operator'),
('operator2', 'operator123', '运营人员B', 'operator');

-- 插入示例达人数据
INSERT INTO kols (name, platform, followers, category, country, email, contact_status, notes, created_by) VALUES
('Emma Watson', 'Instagram', 5200000, '时尚', '美国', 'emma@example.com', '已联系', '时尚博主，合作意向高', 1),
('Takeshi Kitano', 'YouTube', 3800000, '游戏', '日本', 'takeshi@example.com', '待联系', '游戏评测博主', 2),
('Sophie Martin', 'TikTok', 8900000, '美妆', '法国', 'sophie@example.com', '合作中', '美妆达人，粉丝活跃度高', 3);