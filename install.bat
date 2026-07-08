@echo off
echo 正在安装后端依赖...
cd backend
call npm install
echo.
echo 正在安装前端依赖...
cd ..\frontend
call npm install
echo.
echo 所有依赖安装完成！
echo.
echo 启动说明：
echo 1. 打开一个终端，运行: cd backend ^&^& npm run dev
echo 2. 打开另一个终端，运行: cd frontend ^&^& npm start
echo.
pause