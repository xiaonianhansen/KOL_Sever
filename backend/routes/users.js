const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { mockAuthService } = require('../data/mockData');

// 获取所有用户（仅管理员）
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权访问' });
    }
    
    const users = await mockAuthService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新用户权限（仅管理员）
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无权操作' });
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }

    const { viewScope } = req.body;
    
    // 验证 viewScope 格式
    if (viewScope !== undefined && viewScope !== null && !Array.isArray(viewScope)) {
      return res.status(400).json({ success: false, message: 'viewScope 必须为数组或null' });
    }

    const updatedUser = await mockAuthService.updateUser(userId, { viewScope });
    
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({ success: true, data: updatedUser, message: '更新成功' });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;