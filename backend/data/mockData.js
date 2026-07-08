const bcrypt = require('bcryptjs');

// 模拟用户数据（初始密码为明文，启动时会自动哈希）
const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: '管理员',
    role: 'admin',
    passwordHashed: false
  },
  {
    id: 2,
    username: 'operator1',
    password: 'operator123',
    name: '运营人员A',
    role: 'operator',
    viewScope: null,
    managedOperators: [2, 3],
    passwordHashed: false
  },
  {
    id: 3,
    username: 'operator2',
    password: 'operator123',
    name: '运营人员B',
    role: 'operator',
    viewScope: null,
    managedOperators: [],
    passwordHashed: false
  }
];

// 初始化：哈希所有明文密码
(async () => {
  for (const user of users) {
    if (!user.passwordHashed) {
      user.password = await bcrypt.hash(user.password, 10);
      user.passwordHashed = true;
    }
  }
  console.log('✓ 用户密码已加密');
})();

// 模拟海外达人数据
let kols = [
  {
    id: 1,
    name: 'Emma Watson',
    platform: 'Instagram',
    followers: 5200000,
    category: '时尚',
    country: '美国',
    email: 'emma@example.com',
    contactStatus: '已联系',
    notes: '时尚博主，合作意向高',
    createdBy: 1, // 创建人ID
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Takeshi Kitano',
    platform: 'YouTube',
    followers: 3800000,
    category: '游戏',
    country: '日本',
    email: 'takeshi@example.com',
    contactStatus: '待联系',
    notes: '游戏评测博主',
    createdBy: 2,
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  },
  {
    id: 3,
    name: 'Sophie Martin',
    platform: 'TikTok',
    followers: 8900000,
    category: '美妆',
    country: '法国',
    email: 'sophie@example.com',
    contactStatus: '合作中',
    notes: '美妆达人，粉丝活跃度高',
    createdBy: 3,
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z'
  }
];

let nextKolId = 4;

const mockAuthService = {
  login: async (username, password) => {
    const user = users.find(u => u.username === username);
    if (!user) {
      return { success: false, message: '用户名或密码错误' };
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { success: false, message: '用户名或密码错误' };
    }
    
    return { 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        name: user.name, 
        role: user.role,
        viewScope: user.viewScope,
        managedOperators: user.managedOperators
      } 
    };
  },

  getAllUsers: async () => {
    return users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      viewScope: u.viewScope,
      managedOperators: u.managedOperators
    }));
  },

  updateUser: async (id, data) => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...data,
    };
    return users[index];
  }
};

const mockKolService = {
  getAll: async (filters = {}, user = null, page = 1, pageSize = 10) => {
    let result = [...kols];
    
    // 权限过滤：运营人员只能看到自己创建的达人
    if (user && user.role === 'operator') {
      result = result.filter(k => k.createdBy === user.id);
    }
    // 如果运营人员有viewScope（管理员分配的可查看范围），则查看指定人员的达人
    if (user && user.role === 'operator' && user.viewScope && Array.isArray(user.viewScope)) {
      result = result.filter(k => user.viewScope.includes(k.createdBy) || k.createdBy === user.id);
    }
    
    if (filters.platform) {
      result = result.filter(k => k.platform === filters.platform);
    }
    if (filters.category) {
      result = result.filter(k => k.category === filters.category);
    }
    if (filters.country) {
      result = result.filter(k => k.country === filters.country);
    }
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      result = result.filter(k => 
        k.name.toLowerCase().includes(keyword) || 
        k.email.toLowerCase().includes(keyword)
      );
    }
    
    const total = result.length;
    const start = (page - 1) * pageSize;
    const data = result.slice(start, start + pageSize);
    
    return { data, total, page, pageSize };
  },

  getById: async (id, user = null) => {
    const kol = kols.find(k => k.id === id);
    if (!kol) return null;
    
    // 权限检查
    if (user && user.role === 'operator') {
      if (kol.createdBy !== user.id) {
        return null;
      }
    }
    
    return kol;
  },

  create: async (data, user = null) => {
    const newKol = {
      id: nextKolId++,
      ...data,
      createdBy: user ? user.id : 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    kols.push(newKol);
    return newKol;
  },

  update: async (id, data, user = null) => {
    const index = kols.findIndex(k => k.id === id);
    if (index === -1) return null;
    
    // 权限检查：运营人员只能修改自己创建的达人
    if (user && user.role === 'operator') {
      if (kols[index].createdBy !== user.id) {
        return null;
      }
    }
    
    kols[index] = {
      ...kols[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return kols[index];
  },

  delete: async (id, user = null) => {
    const index = kols.findIndex(k => k.id === id);
    if (index === -1) return false;
    
    // 权限检查：运营人员只能删除自己创建的达人
    if (user && user.role === 'operator') {
      if (kols[index].createdBy !== user.id) {
        return false;
      }
    }
    
    kols.splice(index, 1);
    return true;
  },

  getStats: async (user = null) => {
    let filteredKols = [...kols];
    
    // 权限过滤
    if (user && user.role === 'operator') {
      filteredKols = filteredKols.filter(k => k.createdBy === user.id);
    }
    if (user && user.role === 'operator' && user.viewScope && Array.isArray(user.viewScope)) {
      filteredKols = filteredKols.filter(k => user.viewScope.includes(k.createdBy) || k.createdBy === user.id);
    }
    
    const totalKols = filteredKols.length;
    const platforms = [...new Set(filteredKols.map(k => k.platform))];
    const categories = [...new Set(filteredKols.map(k => k.category))];
    const countries = [...new Set(filteredKols.map(k => k.country))];
    const totalFollowers = filteredKols.reduce((sum, k) => sum + k.followers, 0);
    
    // 国家分布统计（包含粉丝数）
    const countryDistribution = countries.map(c => {
      const countryKols = filteredKols.filter(k => k.country === c);
      return {
        country: c,
        count: countryKols.length,
        totalFollowers: countryKols.reduce((sum, k) => sum + k.followers, 0)
      };
    });
    
    return {
      totalKols,
      platforms,
      categories,
      countries,
      totalFollowers,
      platformDistribution: platforms.map(p => ({
        platform: p,
        count: filteredKols.filter(k => k.platform === p).length
      })),
      categoryDistribution: categories.map(c => ({
        category: c,
        count: filteredKols.filter(k => k.category === c).length
      })),
      countryDistribution
    };
  }
};

module.exports = { mockAuthService, mockKolService };