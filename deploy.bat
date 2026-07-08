@echo off
chcp 65001 >nul
echo ==========================================
echo   海外达人录入系统 - Windows 部署脚本
echo ==========================================
echo.

echo [1/4] 安装后端依赖...
cd backend
call npm install --production
cd ..

echo.
echo [2/4] 构建前端...
cd frontend
call npm install
set REACT_APP_API_URL=http://localhost:5000/api
call npm run build
cd ..

echo.
echo [3/4] 安装 PM2 (全局进程管理器)...
call npm install -g pm2

echo.
echo [4/4] 启动服务...
cd backend
call pm2 start server.js --name kol-backend
call pm2 save
cd ..

echo.
echo ==========================================
echo   部署完成！
echo ==========================================
echo.
echo 前端访问: http://localhost:3000
echo 后端 API: http://localhost:5000
echo.
echo 默认账号:
echo   管理员: admin / admin123
echo   运营人员: operator1 / operator123
echo.
echo 常用命令:
echo   查看日志: pm2 logs kol-backend
echo   重启服务: pm2 restart kol-backend
echo   停止服务: pm2 stop kol-backend
echo.
pause