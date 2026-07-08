import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, message, Tag, Card, Typography } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { userAPI } from '../api';
import './UserManagement.css';

const { Option } = Select;

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.data);
    } catch (error) {
      message.error('获取用户列表失败');
    }
    setLoading(false);
  };

  const handleEdit = (record) => {
    setCurrentUser(record);
    form.setFieldsValue({
      viewScope: record.viewScope || []
    });
    setEditModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      await userAPI.update(currentUser.id, values);
      message.success('更新成功');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? '#25F4EE' : '#faad14'}>
          {role === 'admin' ? '管理员' : '运营人员'}
        </Tag>
      )
    },
    {
      title: '可查看范围',
      dataIndex: 'viewScope',
      key: 'viewScope',
      render: (viewScope, record) => {
        if (record.role === 'admin') {
          return <Tag color="#25F4EE">全部</Tag>;
        }
        if (!viewScope || viewScope.length === 0) {
          return <Tag color="#8c8c8c">仅自己</Tag>;
        }
        return (
          <span>
            {viewScope.map(id => {
              const user = users.find(u => u.id === id);
              return user ? (
                <Tag key={id} color="#1890ff">{user.name}</Tag>
              ) : null;
            })}
          </span>
        );
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<SettingOutlined />}
          onClick={() => handleEdit(record)}
          className="btn-edit"
          disabled={record.role === 'admin'}
        >
          分配权限
        </Button>
      )
    }
  ];

  return (
    <div className="user-management">
      <Card>
        <Typography.Title level={4} style={{ color: '#fff', marginBottom: 20 }}>
          用户权限管理
        </Typography.Title>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title="分配查看权限"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="用户"
          >
            <span style={{ color: '#fff' }}>{currentUser?.name} ({currentUser?.username})</span>
          </Form.Item>

          <Form.Item
            name="viewScope"
            label="可查看范围"
            tooltip="选择该运营人员可以查看的其他运营人员录入的达人，不选则只能查看自己录入的"
          >
            <Select
              mode="multiple"
              placeholder="选择可查看的运营人员"
              allowClear
              style={{ width: '100%' }}
            >
              {users
                .filter(u => u.role === 'operator' && u.id !== currentUser?.id)
                .map(u => (
                  <Option key={u.id} value={u.id}>
                    {u.name} ({u.username})
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;