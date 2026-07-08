#!/bin/bash
# ========================================
# 海外达人录入系统 - 部署脚本
# 适用于 Linux 服务器 (Ubuntu/CentOS)
# ========================================

set -e

echo "=========================================="
echo "  海外达人录入系统 - 自动部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 配置变量
APP_DIR="/opt/kol-server"
DB_NAME="kol_db"
DB_USER="kol_user"
DB_PASS="kol_password_2024"  # 请修改为强密码
BACKEND_PORT=5000
FRONTEND_PORT=80

echo ""
echo -e "${YELLOW}[1/7] 安装系统依赖...${NC}"
apt-get update && apt-get install -y \
    nginx \
    mysql-server \
    nodejs \
    npm \
    git \
    curl \
    || {
        # 尝试 yum (CentOS)
        yum update -y
        yum install -y nginx mysql-server nodejs npm git curl
    }

echo ""
echo -e "${YELLOW}[2/7] 安装 PM2 (Node.js 进程管理器)...${NC}"
npm install -g pm2

echo ""
echo -e "${YELLOW}[3/7] 配置 MySQL 数据库...${NC}"
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

# 导入数据库结构
if [ -f "database/schema.sql" ]; then
    mysql -u root ${DB_NAME} < database/schema.sql
    echo -e "${GREEN}数据库结构导入成功${NC}"
fi

echo ""
echo -e "${YELLOW}[4/7] 部署后端...${NC}"
mkdir -p ${APP_DIR}
cp -r backend ${APP_DIR}/

cd ${APP_DIR}/backend
npm install --production

# 更新数据库配置
cat > config/database.js <<EOF
module.exports = {
  host: 'localhost',
  user: '${DB_USER}',
  password: '${DB_PASS}',
  database: '${DB_NAME}',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
EOF

echo ""
echo -e "${YELLOW}[5/7] 构建前端...${NC}"
cd frontend
npm install
export REACT_APP_API_URL="http://localhost:${BACKEND_PORT}/api"
npm run build

echo ""
echo -e "${YELLOW}[6/7] 配置 Nginx...${NC}"
cat > /etc/nginx/sites-available/kol-server <<EOF
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名或服务器IP

    # 前端静态文件
    location / {
        root ${APP_DIR}/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/kol-server /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ""
echo -e "${YELLOW}[7/7] 启动后端服务...${NC}"
cd ${APP_DIR}/backend
pm2 start server.js --name kol-backend
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "访问地址: http://你的服务器IP"
echo "后端 API: http://你的服务器IP/api"
echo ""
echo "默认账号:"
echo "  管理员: admin / admin123"
echo "  运营人员: operator1 / operator123"
echo ""
echo "常用命令:"
echo "  查看日志: pm2 logs kol-backend"
echo "  重启服务: pm2 restart kol-backend"
echo "  停止服务: pm2 stop kol-backend"
echo "  查看状态: pm2 status"
echo ""
echo -e "${YELLOW}注意: 请修改数据库密码和 Nginx 配置中的域名！${NC}"