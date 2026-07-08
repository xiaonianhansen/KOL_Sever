# 一键部署到服务器
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  KOL 管理系统 - 一键部署脚本" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 打包项目
Write-Host "[1/3] 正在打包项目..." -ForegroundColor Green
Set-Location c:\Users\admin\Desktop\kol_server
tar -czf kol_server.tar.gz --exclude=node_modules --exclude=.git --exclude=frontend/node_modules --exclude=backend/node_modules --exclude=frontend/build --exclude=frontend/.env.development --exclude=deploy.ps1 --exclude=deploy.sh .

# 上传到服务器
Write-Host "[2/3] 正在上传到服务器..." -ForegroundColor Green
scp kol_server.tar.gz root@8.163.73.72:/tmp/

# 在服务器执行部署
Write-Host "[3/3] 正在部署到服务器..." -ForegroundColor Green
ssh root@8.163.73.72 "bash /var/www/kol_server/deploy.sh"

# 清理临时文件
Remove-Item kol_server.tar.gz -Force

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  部署完成！" -ForegroundColor Green
Write-Host "  访问地址：http://8.163.73.72" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan