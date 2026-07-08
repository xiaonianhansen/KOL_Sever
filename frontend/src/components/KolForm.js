import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, InputNumber, message, Card, Alert } from 'antd';
import { kolAPI } from '../api';

const { TextArea } = Input;

const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Facebook', '其他'];
const CATEGORIES = ['时尚', '美妆', '游戏', '美食', '旅行', '健身', '科技', '其他'];
const COUNTRIES = ['美国', '日本', '法国', '英国', '德国', '韩国', '泰国', '巴西', '印度', '其他'];
const CONTACT_STATUS = ['待联系', '已联系', '合作中', '已拒绝'];

function KolForm({ kol, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const isEdit = !!kol;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    if (kol) {
      form.setFieldsValue(kol);
    }
  }, [kol, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (isEdit) {
        await kolAPI.update(kol.id, values);
        message.success('更新成功');
      } else {
        await kolAPI.create(values);
        message.success('创建成功');
      }
      form.resetFields();
      onSuccess();
    } catch (error) {
      const errorMsg = error.response?.data?.message || (isEdit ? '更新失败' : '创建失败');
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={isEdit ? '编辑达人信息' : '录入新达人'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ contactStatus: '待联系' }}
      >
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入达人姓名" />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input placeholder="请输入邮箱地址" />
        </Form.Item>

        <Form.Item
          name="platform"
          label="平台"
          rules={[{ required: true, message: '请选择平台' }]}
        >
          <Select placeholder="请选择平台" options={PLATFORMS.map(p => ({ label: p, value: p }))} />
        </Form.Item>

        <Form.Item
          name="category"
          label="类别"
          rules={[{ required: true, message: '请选择类别' }]}
        >
          <Select placeholder="请选择类别" options={CATEGORIES.map(c => ({ label: c, value: c }))} />
        </Form.Item>

        <Form.Item
          name="country"
          label="国家"
          rules={[{ required: true, message: '请选择国家' }]}
        >
          <Select placeholder="请选择国家" options={COUNTRIES.map(c => ({ label: c, value: c }))} />
        </Form.Item>

        <Form.Item
          name="followers"
          label="粉丝数"
          rules={[{ required: true, message: '请输入粉丝数' }]}
        >
          <InputNumber 
            min={0} 
            style={{ width: '100%' }} 
            placeholder="请输入粉丝数"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="contactStatus"
          label="联系状态"
        >
          <Select placeholder="请选择联系状态" options={CONTACT_STATUS.map(s => ({ label: s, value: s }))} />
        </Form.Item>

        <Form.Item
          name="notes"
          label="备注"
        >
          <TextArea rows={4} placeholder="请输入备注信息" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '更新' : '提交'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default KolForm;