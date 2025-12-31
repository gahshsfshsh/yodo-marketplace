@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🚀 YoDo Marketplace Deployment
echo ========================================
echo.

:: Build production
echo [1/3] 📦 Building production version...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] 📤 Uploading to server...
powershell -ExecutionPolicy Bypass -File deploy.ps1
if errorlevel 1 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo [3/3] ✅ Deployment completed!
echo.
echo 🌐 Application URL: http://158.255.6.22:3000
echo.

pause

