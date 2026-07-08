const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { mockKolService } = require('../data/mockData');

// 获取所有达人（支持筛选和分页）
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { platform, category, country, keyword, page = 1, pageSize = 10 } = req.query;
    const filters = { platform, category, country, keyword };
    const result = await mockKolService.getAll(filters, req.user, parseInt(page), parseInt(pageSize));
    res.json({ success: true, data: result.data, total: result.total, page: result.page, pageSize: result.pageSize });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取统计数据
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await mockKolService.getStats(req.user);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取单个达人详情
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const kol = await mockKolService.getById(parseInt(req.params.id), req.user);
    if (!kol) {
      return res.status(404).json({ success: false, message: '达人不存在或无权访问' });
    }
    res.json({ success: true, data: kol });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 创建新达人
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, platform, followers, category, country, email, contactStatus, notes } = req.body;

    if (!name || !platform || !followers || !category || !country || !email) {
      return res.status(400).json({ success: false, message: '必填字段不能为空' });
    }

    // 输入验证
    if (name.length > 100) {
      return res.status(400).json({ success: false, message: '姓名长度不能超过100个字符' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: '邮箱格式不正确' });
    }

    const followersNum = parseInt(followers);
    if (isNaN(followersNum) || followersNum < 0 || followersNum > 1000000000) {
      return res.status(400).json({ success: false, message: '粉丝数必须为有效数字' });
    }

    if (notes && notes.length > 500) {
      return res.status(400).json({ success: false, message: '备注长度不能超过500个字符' });
    }

    const newKol = await mockKolService.create({
      name,
      platform,
      followers: followersNum,
      category,
      country,
      email,
      contactStatus: contactStatus || '待联系',
      notes: notes || ''
    }, req.user);

    res.status(201).json({ success: true, data: newKol, message: '创建成功' });
  } catch (error) {
    console.error('创建达人失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新达人信息
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, platform, followers, category, country, email, contactStatus, notes } = req.body;

    // 输入验证（如果提供了这些字段）
    if (name && name.length > 100) {
      return res.status(400).json({ success: false, message: '姓名长度不能超过100个字符' });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: '邮箱格式不正确' });
      }
    }

    if (followers !== undefined) {
      const followersNum = parseInt(followers);
      if (isNaN(followersNum) || followersNum < 0 || followersNum > 1000000000) {
        return res.status(400).json({ success: false, message: '粉丝数必须为有效数字' });
      }
    }

    if (notes && notes.length > 500) {
      return res.status(400).json({ success: false, message: '备注长度不能超过500个字符' });
    }

    const updatedKol = await mockKolService.update(parseInt(req.params.id), req.body, req.user);
    if (!updatedKol) {
      return res.status(404).json({ success: false, message: '达人不存在或无权修改' });
    }
    res.json({ success: true, data: updatedKol, message: '更新成功' });
  } catch (error) {
    console.error('更新达人失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除达人
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const kolId = parseInt(req.params.id);
    if (isNaN(kolId)) {
      return res.status(400).json({ success: false, message: '无效的达人ID' });
    }

    const deleted = await mockKolService.delete(kolId, req.user);
    if (!deleted) {
      return res.status(404).json({ success: false, message: '达人不存在或无权删除' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除达人失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 批量导入达人
router.post('/batch-import', authMiddleware, async (req, res) => {
  try {
    const { kols } = req.body;

    if (!Array.isArray(kols) || kols.length === 0) {
      return res.status(400).json({ success: false, message: '导入数据不能为空' });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < kols.length; i++) {
      const kolData = kols[i];
      const { name, platform, followers, category, country, email, contactStatus, notes } = kolData;

      // 验证必填字段
      if (!name || !platform || !followers || !category || !country || !email) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: '缺少必填字段'
        });
        continue;
      }

      // 输入验证
      if (name.length > 100) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: '姓名长度不能超过100个字符'
        });
        continue;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: '邮箱格式不正确'
        });
        continue;
      }

      const followersNum = parseInt(followers);
      if (isNaN(followersNum) || followersNum < 0 || followersNum > 1000000000) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: '粉丝数必须为有效数字'
        });
        continue;
      }

      if (notes && notes.length > 500) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: '备注长度不能超过500个字符'
        });
        continue;
      }

      try {
        await mockKolService.create({
          name,
          platform,
          followers: followersNum,
          category,
          country,
          email,
          contactStatus: contactStatus || '待联系',
          notes: notes || ''
        }, req.user);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error.message || '创建失败'
        });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `导入完成：成功 ${results.success} 条，失败 ${results.failed} 条`
    });
  } catch (error) {
    console.error('批量导入达人失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

module.exports = router;