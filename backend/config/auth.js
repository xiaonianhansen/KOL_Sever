// JWT 密钥配置
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error('错误: JWT_SECRET 环境变量未设置');
  process.exit(1);
}

module.exports = {
  JWT_SECRET: jwtSecret,
  JWT_EXPIRE: '7d'
};