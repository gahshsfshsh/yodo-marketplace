@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    YODO - Деплой на сервер
echo ========================================
echo.

set SERVER=Tema@188.68.223.230
set REMOTE_PATH=/home/Tema/yodo

echo [1/4] Подключение к серверу...
echo.

ssh %SERVER% "cd %REMOTE_PATH% && git pull origin main"

echo.
echo [2/4] Перезапуск бэкенда (порт 3000)...
echo.

ssh %SERVER% "lsof -ti:3000 | xargs kill -9 2>/dev/null; cd %REMOTE_PATH%/backend && nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 3000 > server.log 2>&1 &"

echo.
echo [3/4] Перезапуск лендинга (порт 3001)...
echo.

ssh %SERVER% "lsof -ti:3001 | xargs kill -9 2>/dev/null; cd %REMOTE_PATH%/landing && npm run build && nohup npm start > landing.log 2>&1 &"

echo.
echo [4/4] Проверка статуса...
echo.

ssh %SERVER% "sleep 3 && lsof -i:3000 && lsof -i:3001"

echo.
echo ========================================
echo    Деплой завершен!
echo ========================================
echo.
echo Бэкенд: http://188.68.223.230:3000
echo Лендинг: http://188.68.223.230:3001
echo.
pause

