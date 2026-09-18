# IVPS Mechatronics - Production Startup Script
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "         IVPS MECHATRONICS - B2B MACHINERY MARKETPLACE   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow

$PythonPath = "C:\Users\LENOVO\AppData\Local\Python\pythoncore-3.14-64\python.exe"
if (-not (Test-Path $PythonPath)) {
    $PythonPath = "python"
}

Write-Host "[1/2] Launching IVPS Mechatronics Backend & Production Web Server on http://localhost:8000..." -ForegroundColor Cyan
Start-Process -FilePath $PythonPath -ArgumentList "run.py" -WorkingDirectory "$PSScriptRoot\backend"

Write-Host "[2/2] Platform is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor White
Write-Host "  - Marketplace Web App:    http://localhost:8000" -ForegroundColor Yellow
Write-Host "  - Interactive Swagger:    http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "  - API Health Check:       http://localhost:8000/api/health" -ForegroundColor Yellow
Write-Host ""
Write-Host "Demo Accounts available (or use instant 1-click switcher on Login page):" -ForegroundColor White
Write-Host "  - Buyer:  buyer@manufacturing.com / buyer123"
Write-Host "  - Dealer: precision.machinery@dealer.com / seller123"
Write-Host "  - Broker: apex.brokers@machinery.com / broker123"
Write-Host "  - Admin:  admin@ivpsmechatronics.com / admin123"
Write-Host "==========================================================" -ForegroundColor Yellow
