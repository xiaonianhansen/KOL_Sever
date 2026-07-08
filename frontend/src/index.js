import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';
import { ThemeProvider, useTheme, ThemeContext } from './context/ThemeContext';

export { useTheme, ThemeContext, ThemeProvider };

const tiktokTheme = {
  token: {
    colorPrimary: '#25F4EE',
    colorBgContainer: '#121212',
    colorBgElevated: '#1a1a1a',
    colorText: '#ffffff',
    colorTextSecondary: '#8c8c8c',
    colorBorder: '#2f2f2f',
    borderRadius: 8,
    fontFamily: "'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
};

const lightTheme = {
  token: {
    colorPrimary: '#1677ff',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#f5f5f5',
    colorText: '#000000',
    colorTextSecondary: '#666666',
    colorBorder: '#d9d9d9',
    borderRadius: 8,
    fontFamily: "'Proxima Nova', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));

function ThemeWrapper({ children }) {
  const { isDarkMode } = useTheme();
  const currentTheme = isDarkMode ? tiktokTheme : lightTheme;
  const algorithm = isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        ...currentTheme,
        algorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemeWrapper>
        <App />
      </ThemeWrapper>
    </ThemeProvider>
  </React.StrictMode>
);