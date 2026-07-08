const mysql = require('mysql2');

// 验证必需的环境变量
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kol_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// MySQL 数据库配置
const pool = mysql.createPool(dbConfig);

// 监听连接错误
pool.on('error', (err) => {
  console.error('数据库连接池错误:', err);
});

module.exports = pool.promise();