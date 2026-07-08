const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const kolRoutes = require('./routes/kols');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// 安全中间件 - 限制请求体大小
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// CORS 配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/kols', kolRoutes);
app.use('/api/users', userRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '海外达人录入系统后端运行中',
    timestamp: new Date().toISOString()
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ message: `接口 ${req.originalUrl} 不存在` });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  
  // 区分开发环境和生产环境的错误响应
  if (process.env.NODE_ENV === 'development') {
    res.status(err.status || 500).json({ 
      message: '服务器内部错误',
      error: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.status || 500).json({ 
      message: '服务器内部错误'
    });
  }
});

app.listen(PORT, () => {
  console.log(`✓ 后端服务器运行在 http://localhost:${PORT}`);
  console.log(`✓ 环境: ${process.env.NODE_ENV || 'development'}`);
});