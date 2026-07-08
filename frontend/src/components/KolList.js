import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Space, Tag, Popconfirm, message, Card, Row, Col, Statistic, Modal, Descriptions, Upload, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, EyeOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import { kolAPI } from '../api';
import './KolList.css';
import * as XLSX from 'xlsx';

const { Search } = Input;

const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Facebook', '其他'];
const CATEGORIES = ['时尚', '美妆', '游戏', '美食', '旅行', '健身', '科技', '其他'];
const COUNTRIES = ['美国', '日本', '法国', '英国', '德国', '韩国', '泰国', '其他'];
const CONTACT_STATUS = ['待联系', '已联系', '合作中', '已拒绝'];

const statusColorMap = {
  '待联系': 'default',
  '已联系': 'processing',
  '合作中': 'success',
  '已拒绝': 'error'
};

function KolList({ onEdit }) {
  const [kols, setKols] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [stats, setStats] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentKol, setCurrentKol] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchKols();
    fetchStats();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { userAPI } = await import('../api');
      const response = await userAPI.getAll();
      setUsers(response.data.data);
    } catch (error) {
      // 运营人员无权获取用户列表，忽略错误
    }
  };

  const fetchKols = async (searchFilters = {}, pageNum = 1, size = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await kolAPI.getAll({ ...searchFilters, page: pageNum, pageSize: size });
      setKols(response.data.data);
      setPagination({
        current: response.data.page,
        pageSize: response.data.pageSize,
        total: response.data.total
      });
    } catch (error) {
      message.error('获取达人列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await kolAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('获取统计数据失败');
    }
  };

  const handleSearch = (value) => {
    const newFilters = { ...filters, keyword: value };
    setFilters(newFilters);
    fetchKols(newFilters, 1);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value || undefined };
    setFilters(newFilters);
    fetchKols(newFilters, 1);
  };

  const handleTableChange = (newPagination) => {
    fetchKols(filters, newPagination.current, newPagination.pageSize);
  };

  const handleDelete = async (id) => {
    try {
      await kolAPI.delete(id);
      message.success('删除成功');
      fetchKols(filters, pagination.current, pagination.pageSize);
      fetchStats();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleView = (record) => {
    setCurrentKol(record);
    setViewModalVisible(true);
  };

  const handleExport = () => {
    if (kols.length === 0) {
      message.warning('没有可导出的数据');
      return;
    }

    // 表头
    const headers = ['ID', '姓名', '平台', '类别', '国家', '粉丝数', '邮箱', '联系状态', '备注', '录入人'];
    
    // 数据行
    const dataRows = kols.map(kol => {
      const creator = users.find(u => u.id === kol.createdBy);
      return [
        kol.id,
        kol.name,
        kol.platform,
        kol.category,
        kol.country,
        kol.followers,
        kol.email,
        kol.contactStatus,
        kol.notes || '',
        creator ? creator.name : '-'
      ];
    });

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '达人数据');

    // 设置列宽
    ws['!cols'] = [
      { wch: 8 },   // ID
      { wch: 20 },  // 姓名
      { wch: 15 },  // 平台
      { wch: 12 },  // 类别
      { wch: 12 },  // 国家
      { wch: 15 },  // 粉丝数
      { wch: 30 },  // 邮箱
      { wch: 12 },  // 联系状态
      { wch: 30 },  // 备注
      { wch: 15 }   // 录入人
    ];

    // 生成文件名（包含筛选条件）
    const filterDesc = [];
    if (filters.platform) filterDesc.push(filters.platform);
    if (filters.category) filterDesc.push(filters.category);
    if (filters.country) filterDesc.push(filters.country);
    if (filters.keyword) filterDesc.push(filters.keyword);
    
    const fileName = filterDesc.length > 0 
      ? `海外达人数据_${filterDesc.join('_')}_${new Date().toLocaleDateString()}.xlsx`
      : `海外达人数据_全部_${new Date().toLocaleDateString()}.xlsx`;

    XLSX.writeFile(wb, fileName);
    message.success(`已导出 ${kols.length} 条数据`);
  };

  const downloadTemplate = () => {
    const headers = ['姓名', '平台', '类别', '国家', '粉丝数', '邮箱', '联系状态', '备注'];
    const exampleData = [
      ['张三', 'Instagram', '时尚', '美国', 500000, 'zhangsan@example.com', '待联系', '示例数据'],
      ['李四', 'YouTube', '美食', '日本', 1200000, 'lisi@example.com', '已联系', '示例数据'],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...exampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '达人导入模板');

    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 30 }
    ];

    XLSX.writeFile(wb, '海外达人导入模板.xlsx');
  };

  const handleImport = async (file) => {
    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            message.warning('文件中没有数据');
            setImporting(false);
            return;
          }

          // 验证数据格式
          const requiredFields = ['姓名', '平台', '类别', '国家', '粉丝数', '邮箱'];
          const firstRow = jsonData[0];
          const missingFields = requiredFields.filter(field => !(field in firstRow));

          if (missingFields.length > 0) {
            message.error(`缺少必要字段：${missingFields.join(', ')}`);
            setImporting(false);
            return;
          }

          // 转换数据格式
          const kolsToImport = jsonData.map(row => ({
            name: row['姓名'],
            platform: row['平台'],
            category: row['类别'],
            country: row['国家'],
            followers: parseInt(row['粉丝数']) || 0,
            email: row['邮箱'],
            contactStatus: row['联系状态'] || '待联系',
            notes: row['备注'] || ''
          }));

          // 批量导入
          try {
            const response = await kolAPI.batchImport({ kols: kolsToImport });
            const { success, failed } = response.data.data;
            
            if (success > 0) {
              message.success(`成功导入 ${success} 条数据${failed > 0 ? `，${failed} 条失败` : ''}`);
              fetchKols(filters, 1);
              fetchStats();
              setImportModalVisible(false);
            } else {
              message.error('导入失败，请检查数据格式');
            }
          } catch (error) {
            message.error(error.response?.data?.message || '批量导入失败');
          }
        } catch (error) {
          message.error('文件解析失败，请检查文件格式');
        }
        setImporting(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      message.error('文件读取失败');
      setImporting(false);
    }
    return false; // 阻止默认上传行为
  };

  const formatFollowers = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform) => <Tag color="blue">{platform}</Tag>
    },
    {
      title: '粉丝数',
      dataIndex: 'followers',
      key: 'followers',
      width: 120,
      render: (followers) => formatFollowers(followers)
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => <Tag color="green">{category}</Tag>
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      width: 100
    },
    {
      title: '联系状态',
      dataIndex: 'contactStatus',
      key: 'contactStatus',
      width: 120,
      render: (status) => <Tag color={statusColorMap[status]}>{status}</Tag>
    },
    {
      title: '录入人',
      key: 'createdBy',
      width: 120,
      render: (_, record) => {
        const creator = users.find(u => u.id === record.createdBy);
        return creator ? creator.name : '-';
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => {
        // 权限检查：运营人员只能编辑/删除自己创建的达人
        const canEdit = currentUser?.role === 'admin' || record.createdBy === currentUser?.id;
        
        return (
          <Space>
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
              className="btn-view"
            >
              查看
            </Button>
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => onEdit(record)}
              className="btn-edit"
              disabled={!canEdit}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除此达人吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />} 
                className="btn-delete"
                disabled={!canEdit}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <div>
      {stats && (
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="达人总数" value={stats.totalKols} />
            </Col>
            <Col span={6}>
              <Statistic title="总粉丝数" value={stats.totalFollowers} formatter={(value) => formatFollowers(value)} suffix="粉丝" />
            </Col>
            <Col span={6}>
              <Statistic title="平台数" value={stats.platforms.length} />
            </Col>
            <Col span={6}>
              <Statistic title="类别数" value={stats.categories.length} />
            </Col>
          </Row>
        </Card>
      )}

      <Card style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="搜索姓名或邮箱"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Space>
            <Select
              placeholder="平台筛选"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('platform', value)}
              options={PLATFORMS.map(p => ({ label: p, value: p }))}
            />
            <Select
              placeholder="类别筛选"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('category', value)}
              options={CATEGORIES.map(c => ({ label: c, value: c }))}
            />
            <Select
              placeholder="国家筛选"
              allowClear
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('country', value)}
              options={COUNTRIES.map(c => ({ label: c, value: c }))}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => onEdit(null)}
            >
              新增达人
            </Button>
            <Button 
              icon={<UploadOutlined />}
              onClick={() => setImportModalVisible(true)}
            >
              批量导入
            </Button>
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={kols.length === 0}
            >
              导出数据
            </Button>
          </Space>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={kols}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 10
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="达人详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={600}
      >
        {currentKol && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="姓名" span={2}>{currentKol.name}</Descriptions.Item>
            <Descriptions.Item label="邮箱" span={2}>{currentKol.email}</Descriptions.Item>
            <Descriptions.Item label="平台">
              <Tag color="blue">{currentKol.platform}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="类别">
              <Tag color="green">{currentKol.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="国家">{currentKol.country}</Descriptions.Item>
            <Descriptions.Item label="粉丝数">{formatFollowers(currentKol.followers)}</Descriptions.Item>
            <Descriptions.Item label="联系状态">
              <Tag color={statusColorMap[currentKol.contactStatus]}>
                {currentKol.contactStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(currentKol.createdAt).toLocaleString('zh-CN')}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {currentKol.notes || '无'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="批量导入达人"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={600}
        className="import-modal"
      >
        <div style={{ padding: '20px 0' }}>
          <Typography.Paragraph>
            请上传 Excel 文件（.xlsx 格式）进行批量导入。
          </Typography.Paragraph>
          
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            onClick={downloadTemplate}
            style={{ marginBottom: 20, padding: 0 }}
          >
            下载导入模板
          </Button>

          <Upload.Dragger
            accept=".xlsx,.xls"
            beforeUpload={handleImport}
            showUploadList={false}
            disabled={importing}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#25F4EE' }} />
            </p>
            <p style={{ fontSize: 16, margin: '12px 0' }}>
              {importing ? '正在导入...' : '点击或拖拽文件到此区域'}
            </p>
            <p style={{ color: '#8c8c8c', fontSize: 12 }}>
              支持 .xlsx 和 .xls 格式，请使用下载的模板填写数据
            </p>
          </Upload.Dragger>

          <Card style={{ marginTop: 20, background: '#1a1a1a', border: '1px solid #2f2f2f' }}>
            <Typography.Title level={5} style={{ color: '#fff', marginTop: 0 }}>导入说明</Typography.Title>
            <Typography.Paragraph style={{ color: '#8c8c8c', marginBottom: 8 }}>
              1. 下载并填写导入模板
            </Typography.Paragraph>
            <Typography.Paragraph style={{ color: '#8c8c8c', marginBottom: 8 }}>
              2. 必填字段：姓名、平台、类别、国家、粉丝数、邮箱
            </Typography.Paragraph>
            <Typography.Paragraph style={{ color: '#8c8c8c', marginBottom: 8 }}>
              3. 可选字段：联系状态（默认"待联系"）、备注
            </Typography.Paragraph>
            <Typography.Paragraph style={{ color: '#8c8c8c', marginBottom: 0 }}>
              4. 平台可选值：Instagram、YouTube、TikTok、Twitter、Facebook、其他
            </Typography.Paragraph>
          </Card>
        </div>
      </Modal>
    </div>
  );
}

export default KolList;