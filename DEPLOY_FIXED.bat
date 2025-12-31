@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🚀 YoDo Marketplace Deployment
echo ========================================
echo.
echo Сервер: Tema@188.68.223.230
echo Backend: порт 3000
echo Landing: порт 3001
echo.

set SERVER_USER=Tema
set SERVER_IP=188.68.223.230
set SERVER_PATH=/home/Tema/yodo

echo [1/4] Подключение к серверу...
echo.

:: Создаем директории на сервере
echo Создание директорий на сервере...
ssh %SERVER_USER%@%SERVER_IP% "mkdir -p %SERVER_PATH%/backend && mkdir -p %SERVER_PATH%/landing"

if errorlevel 1 (
    echo ❌ Не удалось подключиться к серверу!
    echo.
    echo Проверьте:
    echo 1. SSH доступ: ssh %SERVER_USER%@%SERVER_IP%
    echo 2. Пароль пользователя Tema
    echo 3. Доступность сервера
    pause
    exit /b 1
)

echo.
echo [2/4] Перезапуск бэкенда (порт 3000)...

:: Backend
ssh %SERVER_USER%@%SERVER_IP% "cd %SERVER_PATH%/backend && pkill -f 'uvicorn' || true && nohup python -m uvicorn main:app --host 0.0.0.0 --port 3000 > backend.log 2>&1 &"

echo.
echo [3/4] Деплой лендинга (порт 3001)...

:: Собираем локально
cd D:\yodo\landing
if not exist "node_modules" (
    echo Установка зависимостей...
    call npm install --force
)

echo Сборка production версии...
call npm run build

if errorlevel 1 (
    echo ❌ Ошибка сборки!
    pause
    exit /b 1
)

:: Копируем на сервер
echo Копирование файлов на сервер...
scp -r .next %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/landing/
scp -r public %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/landing/
scp -r src %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/landing/
scp package.json %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/landing/
scp package-lock.json %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/landing/
scp next.config.ts %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/landing/
scp tsconfig.json %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/landing/
scp tailwind.config.ts %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/landing/
scp postcss.config.mjs %SERVER_USER%@%SERVER_IP%:%SERVER_PATH%/landing/

:: Запускаем на сервере
echo Запуск лендинга на сервере...
ssh %SERVER_USER%@%SERVER_IP% "cd %SERVER_PATH%/landing && npm install --production && pkill -f 'next start' || true && nohup npm start -- -p 3001 > landing.log 2>&1 &"

echo.
echo [4/4] Проверка статуса...
timeout /t 3 >nul

ssh %SERVER_USER%@%SERVER_IP% "ps aux | grep -E 'uvicorn|next' | grep -v grep"

echo.
echo ========================================
echo   ✅ Деплой завершен!
echo ========================================
echo.
echo Backend: http://188.68.223.230:3000
echo Landing: http://188.68.223.230:3001
echo.
echo 📊 Для проверки логов:
echo   Backend: ssh %SERVER_USER%@%SERVER_IP% "tail -f %SERVER_PATH%/backend/backend.log"
echo   Landing: ssh %SERVER_USER%@%SERVER_IP% "tail -f %SERVER_PATH%/landing/landing.log"
echo.

pause

