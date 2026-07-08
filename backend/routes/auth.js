const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/auth');
const { mockAuthService } = require('../data/mockData');

// 登录接口
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: '用户名和密码格式不正确' });
    }

    const result = await mockAuthService.login(username.trim(), password);

    if (!result.success) {
      return res.status(401).json({ message: result.message });
    }

    const token = jwt.sign(
      { 
        id: result.user.id, 
        username: result.user.username,
        role: result.user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      message: '登录成功',
      token,
      user: result.user
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;