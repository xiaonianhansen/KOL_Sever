import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { message } from 'antd';

// TikTok 风格主题配置
const tiktokTheme = {
  token: {
    colorPrimary: '#25F4EE',
    colorBgContainer: '#121212',
    colorBgElevated: '#1a1a1a',
    colorText: '#ffffff',
    colorTextSecondary: '#8c8c8c',
    colorBorder: '#2f2f2f',
    borderRadius: 8,
  },
  components: {
    Button: {
      primaryShadow: '0 4px 12px rgba(37, 244, 238, 0.3)',
    },
    Table: {
      headerBg: '#1a1a1a',
      headerColor: '#25F4EE',
      rowHoverBg: 'rgba(37, 244, 238, 0.05)',
    },
  },
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    message.success('登录成功');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    message.success('已退出登录');
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px' }}>加载中...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;