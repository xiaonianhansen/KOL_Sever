# 安装依赖脚本
Write-Host "正在安装后端依赖..." -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"
npm install

Write-Host "`n正在安装前端依赖..." -ForegroundColor Green
Set-Location "$PSScriptRoot\frontend"
npm install

Write-Host "`n所有依赖安装完成！" -ForegroundColor Green
Write-Host "`n启动说明：" -ForegroundColor Yellow
Write-Host "1. 启动后端: cd backend; npm run dev"
Write-Host "2. 启动前端: cd frontend; npm start"
Write-Host "`n默认账号: admin / admin123" -ForegroundColor Cyan