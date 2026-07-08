# 海外达人录入系统 (KOL Management System)

一个前后端分离的海外达人（KOL）录入和管理系统。

## 技术栈

### 后端
- Node.js + Express
- MySQL (支持模拟数据模式)
- JWT 认证
- CORS 跨域支持

### 前端
- React 18
- Ant Design UI 组件库
- React Router 路由
- Axios HTTP 客户端

## 项目结构

```
kol_server/
├── backend/              # 后端代码
│   ├── config/          # 配置文件
│   ├── data/            # 模拟数据
│   ├── middleware/      # 中间件
│   ├── routes/          # 路由
│   ├── server.js        # 入口文件
│   └── package.json
├── frontend/            # 前端代码
│   ├── public/
│   ├── src/
│   │   ├── api/        # API 接口
│   │   ├── components/ # 组件
│   │   ├── pages/      # 页面
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── database/            # 数据库脚本
    └── schema.sql
```

## 快速开始

### 环境要求
- Node.js >= 14
- MySQL >= 5.7 (可选，当前使用模拟数据)

### 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 启动项目

```bash
# 启动后端 (端口 5000)
cd backend
npm run dev

# 启动前端 (端口 3000)
cd frontend
npm start
```

### 默认账号
- 用户名: admin
- 密码: admin123

## 功能特性

- ✅ 用户登录认证 (JWT)
- ✅ 达人列表展示
- ✅ 达人信息录入
- ✅ 达人信息编辑
- ✅ 达人信息删除
- ✅ 多条件筛选 (平台/类别/国家/关键词)
- ✅ 数据统计面板
- ✅ 响应式设计

## API 接口

### 认证
- `POST /api/auth/login` - 用户登录

### 达人管理
- `GET /api/kols` - 获取达人列表 (支持筛选)
- `GET /api/kols/stats` - 获取统计数据
- `GET /api/kols/:id` - 获取达人详情
- `POST /api/kols` - 创建达人
- `PUT /api/kols/:id` - 更新达人
- `DELETE /api/kols/:id` - 删除达人

## 数据库配置

如需切换到真实 MySQL 数据库：

1. 执行 `database/schema.sql` 创建数据库和表
2. 修改 `backend/config/database.js` 中的数据库配置
3. 将路由中的模拟数据服务替换为数据库查询

## 开发说明

当前系统使用模拟数据，无需配置 MySQL 即可运行。后续可无缝切换到真实数据库。