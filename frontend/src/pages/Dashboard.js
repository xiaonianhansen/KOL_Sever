import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Button, Drawer, Switch } from 'antd';
import { 
  UserOutlined, 
  DashboardOutlined, 
  TeamOutlined, 
  LogoutOutlined,
  BarChartOutlined,
  MenuOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import KolList from '../components/KolList';
import KolForm from '../components/KolForm';
import Stats from '../components/Stats';
import UserManagement from '../components/UserManagement';
import { useTheme } from '../index';
import './Dashboard.css';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function Dashboard({ onLogout }) {
  const [currentMenu, setCurrentMenu] = useState('list');
  const [user, setUser] = useState(null);
  const [selectedKol, setSelectedKol] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMenuClick = ({ key }) => {
    setCurrentMenu(key);
    setSelectedKol(null);
    setMobileMenuOpen(false);
  };

  const handleEditKol = (kol) => {
    setSelectedKol(kol);
    setCurrentMenu('form');
  };

  const handleFormSuccess = () => {
    setCurrentMenu('list');
    setSelectedKol(null);
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout
    }
  ];

  const menuItems = [
    {
      key: 'list',
      icon: <TeamOutlined />,
      label: '达人列表'
    },
    {
      key: 'add',
      icon: <UserOutlined />,
      label: '录入达人'
    },
    {
      key: 'stats',
      icon: <BarChartOutlined />,
      label: '数据统计'
    }
  ];

  // 管理员专属菜单
  if (user?.role === 'admin') {
    menuItems.push({
      key: 'users',
      icon: <SettingOutlined />,
      label: '用户管理'
    });
  }

  return (
    <Layout className="dashboard-layout">
      {isMobile ? (
        <>
          <div className="mobile-header">
            <button 
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuOutlined />
            </button>
            <span className="mobile-title">KOL 管理系统</span>
            <div className="mobile-actions">
              <Switch
                checkedChildren={<SunOutlined />}
                unCheckedChildren={<MoonOutlined />}
                checked={isDarkMode}
                onChange={toggleTheme}
                className="theme-switch"
              />
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="mobile-user">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span className="username">{user?.name || user?.username}</span>
                </div>
              </Dropdown>
            </div>
          </div>

          <Drawer
            title="菜单"
            placement="left"
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            className="mobile-drawer"
            styles={{
              body: { padding: 0 },
              header: { display: 'none' }
            }}
          >
            <div className="logo">
              <Title level={4}>KOL 管理系统</Title>
            </div>
            <Menu
              mode="inline"
              selectedKeys={[currentMenu]}
              items={menuItems}
              onClick={handleMenuClick}
            />
          </Drawer>
        </>
      ) : (
        <Sider theme="light" className="dashboard-sider">
          <div className="logo">
            <Title level={4}>KOL 管理系统</Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentMenu]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
      )}

      <Layout>
        {!isMobile && (
          <Header className="dashboard-header">
          <Title level={4} style={{ margin: 0, color: '#fff' }}>
            {currentMenu === 'list' && '达人列表'}
            {currentMenu === 'add' && '录入达人'}
            {currentMenu === 'form' && (selectedKol ? '编辑达人' : '录入达人')}
            {currentMenu === 'stats' && '数据统计'}
          </Title>
          <div className="header-actions">
            <Switch
              checkedChildren={<SunOutlined />}
              unCheckedChildren={<MoonOutlined />}
              checked={isDarkMode}
              onChange={toggleTheme}
              className="theme-switch"
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="username">{user?.name || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        )}

        <Content className="dashboard-content">
          {currentMenu === 'list' && (
            <KolList onEdit={handleEditKol} />
          )}
          {currentMenu === 'add' && (
            <KolForm onSuccess={handleFormSuccess} />
          )}
          {currentMenu === 'form' && (
            <KolForm 
              kol={selectedKol} 
              onSuccess={handleFormSuccess} 
            />
          )}
          {currentMenu === 'stats' && (
            <Stats />
          )}
          {currentMenu === 'users' && user?.role === 'admin' && (
            <UserManagement />
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

export default Dashboard;