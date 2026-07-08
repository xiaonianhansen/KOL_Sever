@echo off
echo 正在启动后端服务器...
cd /d %~dp0backend
npm run dev
pause