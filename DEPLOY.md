# 海外达人录入系统 - 部署指南

## 📋 部署方案选择

### 方案一：Windows 本地服务器（简单）
适合：Windows 服务器、本地测试

### 方案二：Linux 云服务器（推荐）
适合：生产环境、阿里云/腾讯云/AWS

### 方案三：Docker 容器化（高级）
适合：多环境部署、团队协作

---

## 🪟 方案一：Windows 部署

### 1. 环境准备
- 安装 Node.js (v16+)：https://nodejs.org/
- 安装 MySQL 8.0：https://dev.mysql.com/downloads/
- 安装 Nginx（可选）：http://nginx.org/

### 2. 一键部署
```bash
# 双击运行或在命令行执行
deploy.bat
```

### 3. 手动部署步骤

#### 3.1 配置数据库
```bash
# 登录 MySQL
mysql -u root -p

# 执行建表脚本
source database/schema.sql
```

#### 3.2 配置后端
编辑 `backend/config/database.js`：
```javascript
module.exports = {
  host: 'localhost',
  user: '你的数据库用户名',
  password: '你的数据库密码',
  database: 'kol_db',
  port: 3306
};
```

#### 3.3 构建前端
```bash
cd frontend
npm install
set REACT_APP_API_URL=http://你的服务器IP:5000/api
npm run build
```

#### 3.4 启动服务
```bash
# 使用 PM2 管理进程
npm install -g pm2

cd backend
pm2 start server.js --name kol-backend
pm2 save

# 设置开机自启
pm2 startup
pm2 save
```

---

## 🐧 方案二：Linux 云服务器部署（推荐）

### 1. 服务器要求
- 系统：Ubuntu 20.04+ / CentOS 8+
- 配置：2核4G 起步
- 带宽：1Mbps+
- 存储：20GB+

### 2. 一键部署
```bash
# 上传项目到服务器后执行
sudo chmod +x deploy.sh
sudo ./deploy.sh
```

### 3. 手动部署步骤

#### 3.1 安装环境
```bash
# Ubuntu
sudo apt update
sudo apt install -y nginx mysql-server nodejs npm

# CentOS
sudo yum update -y
sudo yum install -y nginx mysql-server nodejs npm
```

#### 3.2 配置 MySQL
```bash
sudo mysql -u root
```

```sql
CREATE DATABASE kol_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'kol_user'@'localhost' IDENTIFIED BY '你的强密码';
GRANT ALL PRIVILEGES ON kol_db.* TO 'kol_user'@'localhost';
FLUSH PRIVILEGES;
exit;
```

导入数据库结构：
```bash
mysql -u root kol_db < database/schema.sql
```

#### 3.3 配置后端
```bash
mkdir -p /opt/kol-server
cp -r backend /opt/kol-server/
cd /opt/kol-server/backend
npm install --production
```

编辑数据库配置：
```bash
nano config/database.js
```

#### 3.4 构建前端
```bash
cd /opt/kol-server/frontend
npm install
export REACT_APP_API_URL=http://你的服务器IP:5000/api
npm run build
```

#### 3.5 配置 Nginx
```bash
sudo nano /etc/nginx/sites-available/kol-server
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name 你的域名或IP;

    # 前端静态文件
    location / {
        root /opt/kol-server/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/kol-server /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 3.6 启动后端
```bash
sudo npm install -g pm2
cd /opt/kol-server/backend
pm2 start server.js --name kol-backend
pm2 save
sudo pm2 startup
pm2 save
```

---

## 🐳 方案三：Docker 部署

### 1. 创建 Dockerfile

**后端 Dockerfile** (`backend/Dockerfile`)：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**前端 Dockerfile** (`frontend/Dockerfile`)：
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. 创建 docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: kol_db
      MYSQL_USER: kol_user
      MYSQL_PASSWORD: kol_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DB_HOST: mysql
      DB_USER: kol_user
      DB_PASSWORD: kol_password
      DB_NAME: kol_db
    depends_on:
      - mysql

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

### 3. 启动
```bash
docker-compose up -d
```

---

## 🔧 常用运维命令

### PM2 进程管理
```bash
pm2 status              # 查看状态
pm2 logs kol-backend    # 查看日志
pm2 restart kol-backend # 重启服务
pm2 stop kol-backend    # 停止服务
pm2 monit               # 监控资源
```

### Nginx 管理
```bash
sudo nginx -t           # 测试配置
sudo systemctl restart nginx  # 重启
sudo systemctl status nginx   # 查看状态
sudo tail -f /var/log/nginx/access.log  # 访问日志
sudo tail -f /var/log/nginx/error.log   # 错误日志
```

### MySQL 管理
```bash
mysql -u kol_user -p kol_db  # 登录数据库
SHOW TABLES;                  # 查看表
SELECT COUNT(*) FROM kols;    # 查询数据量
```

---

## 🔒 安全建议

1. **修改默认密码**
   - 数据库密码
   - 管理员账号密码
   - JWT Secret

2. **配置防火墙**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

3. **配置 HTTPS**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

4. **定期备份**
   ```bash
   mysqldump -u kol_user -p kol_db > backup_$(date +%Y%m%d).sql
   ```

---

## 📞 常见问题

### Q: 前端页面空白？
A: 检查 `REACT_APP_API_URL` 是否正确配置

### Q: 后端连接数据库失败？
A: 检查 `config/database.js` 配置是否正确

### Q: Nginx 502 错误？
A: 检查后端服务是否正常运行：`pm2 status`

### Q: 跨域问题？
A: 确保 Nginx 配置了正确的代理设置