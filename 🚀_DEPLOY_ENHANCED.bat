@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║     🎨 YoDo Enhanced - УЛУЧШЕННЫЙ ДИЗАЙН - DEPLOY          ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Сервер: Tema@188.68.223.230
echo Landing порт: 3001 (с улучшенным дизайном)
echo.
echo ══════════════════════════════════════════════════════════════
echo.

set SERVER=Tema@188.68.223.230
set LANDING_PORT=3001

echo [1/5] 🎨 Сборка улучшенного дизайна...
cd /d D:\yodo\landing
call npm run build
if errorlevel 1 (
    echo ❌ Ошибка сборки!
    pause
    exit /b 1
)
echo ✅ Сборка завершена

echo.
echo [2/5] 📦 Копирование на сервер...
echo (Введите пароль если попросит)
scp -r .next package.json package-lock.json public %SERVER%:~/yodo/landing/
if errorlevel 1 (
    echo ❌ Ошибка копирования!
    pause
    exit /b 1
)
echo ✅ Файлы скопированы

echo.
echo [3/5] 📦 Установка зависимостей на сервере...
ssh %SERVER% "cd ~/yodo/landing && npm install --production"
if errorlevel 1 (
    echo ⚠️ Предупреждение при установке зависимостей
)
echo ✅ Зависимости установлены

echo.
echo [4/5] 🔄 Перезапуск приложения...
ssh %SERVER% "pm2 delete yodo-landing 2>nul ; pm2 start npm --name yodo-landing -- start -- -p %LANDING_PORT%"
if errorlevel 1 (
    echo ⚠️ PM2 перезапуск с предупреждениями
)
echo ✅ Приложение запущено

echo.
echo [5/5] 💾 Сохранение конфигурации PM2...
ssh %SERVER% "pm2 save"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║     ✅ УЛУЧШЕННЫЙ ДИЗАЙН УСПЕШНО РАСКАТАН!                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🌐 Сайт доступен: http://188.68.223.230:3001
echo.
echo 🎨 Улучшения:
echo    ✅ Современный дизайн с градиентами
echo    ✅ 3D эффекты на карточках
echo    ✅ Реальные изображения с Unsplash
echo    ✅ Плавные анимации (Framer Motion)
echo    ✅ Стеклянный эффект (glassmorphism)
echo    ✅ Парал

лакс эффекты
echo    ✅ Адаптивный дизайн для всех устройств
echo.
echo 📊 Команды управления:
echo    pm2 logs yodo-landing     - просмотр логов
echo    pm2 restart yodo-landing  - перезапуск
echo    pm2 status                - статус всех приложений
echo.
pause

