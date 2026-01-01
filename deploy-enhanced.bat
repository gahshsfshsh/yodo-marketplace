@echo off
chcp 65001 >nul
cls
echo.
echo ═══════════════════════════════════════════
echo   YoDo Enhanced Design - DEPLOY
echo ═══════════════════════════════════════════
echo.
echo Сервер: Tema@188.68.223.230
echo Порт: 3001
echo.

set SERVER=Tema@188.68.223.230
set PORT=3001

echo [1/4] Копирование файлов на сервер...
cd /d D:\yodo\landing
scp -r .next package.json package-lock.json public %SERVER%:~/yodo/landing/
if errorlevel 1 (
    echo Ошибка копирования
    pause
    exit /b 1
)
echo OK

echo.
echo [2/4] Установка зависимостей...
ssh %SERVER% "cd ~/yodo/landing && npm install --production"
echo OK

echo.
echo [3/4] Перезапуск приложения...
ssh %SERVER% "pm2 delete yodo-landing 2>nul || true && pm2 start npm --name yodo-landing -- start -- -p %PORT%"
echo OK

echo.
echo [4/4] Сохранение конфигурации...
ssh %SERVER% "pm2 save"
echo OK

echo.
echo ═══════════════════════════════════════════
echo   УСПЕШНО РАСКАТАНО!
echo ═══════════════════════════════════════════
echo.
echo URL: http://188.68.223.230:3001
echo.
pause

