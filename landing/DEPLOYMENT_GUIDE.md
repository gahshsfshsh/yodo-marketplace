# 🚀 YoDo Marketplace - Руководство по деплою

## 📋 Информация о сервере

- **IP:** 158.255.6.22
- **Пользователь:** alexei
- **Порт приложения:** 3000
- **URL:** http://158.255.6.22:3000

## 🎯 Быстрый деплой (Windows)

### Вариант 1: Автоматический деплой
```bash
# Просто запустите батник
DEPLOY.bat
```

### Вариант 2: PowerShell скрипт
```powershell
# Запустите PowerShell скрипт
powershell -ExecutionPolicy Bypass -File deploy.ps1
```

## 🐧 Деплой на Linux/Mac

```bash
# Сделайте скрипт исполняемым
chmod +x deploy.sh

# Запустите деплой
./deploy.sh
```

## 📦 Ручной деплой (пошагово)

### Шаг 1: Сборка проекта
```bash
cd D:\yodo\landing
npm install --force
npm run build
```

### Шаг 2: Подключение к серверу
```bash
ssh alexei@158.255.6.22
```

### Шаг 3: Создание директории на сервере
```bash
mkdir -p /home/alexei/yodo-marketplace
```

### Шаг 4: Копирование файлов
```bash
# На вашем компьютере (Windows PowerShell)
scp -r .next alexei@158.255.6.22:/home/alexei/yodo-marketplace/
scp -r public alexei@158.255.6.22:/home/alexei/yodo-marketplace/
scp -r src alexei@158.255.6.22:/home/alexei/yodo-marketplace/
scp package*.json alexei@158.255.6.22:/home/alexei/yodo-marketplace/
scp next.config.ts alexei@158.255.6.22:/home/alexei/yodo-marketplace/
scp tsconfig.json alexei@158.255.6.22:/home/alexei/yodo-marketplace/
scp tailwind.config.ts alexei@158.255.6.22:/home/alexei/yodo-marketplace/
scp postcss.config.mjs alexei@158.255.6.22:/home/alexei/yodo-marketplace/
```

### Шаг 5: Установка зависимостей на сервере
```bash
ssh alexei@158.255.6.22
cd /home/alexei/yodo-marketplace
npm install --production
```

### Шаг 6: Запуск приложения

#### С PM2 (рекомендуется):
```bash
# Установите PM2 если еще не установлен
npm install -g pm2

# Запустите приложение
pm2 start npm --name "yodo-landing" -- start -- -p 3000
pm2 save
pm2 startup
```

#### Без PM2 (с nohup):
```bash
nohup npm start > app.log 2>&1 &
```

## 🔧 Управление приложением на сервере

### Проверка статуса
```bash
# С PM2
ssh alexei@158.255.6.22 'pm2 status'

# Без PM2
ssh alexei@158.255.6.22 'ps aux | grep node'
```

### Просмотр логов
```bash
# С PM2
ssh alexei@158.255.6.22 'pm2 logs yodo-landing'

# Без PM2
ssh alexei@158.255.6.22 'tail -f /home/alexei/yodo-marketplace/app.log'
```

### Перезапуск приложения
```bash
# С PM2
ssh alexei@158.255.6.22 'cd /home/alexei/yodo-marketplace && pm2 restart yodo-landing'

# Без PM2
ssh alexei@158.255.6.22 'pkill -f "next start" && cd /home/alexei/yodo-marketplace && nohup npm start > app.log 2>&1 &'
```

### Остановка приложения
```bash
# С PM2
ssh alexei@158.255.6.22 'pm2 stop yodo-landing'

# Без PM2
ssh alexei@158.255.6.22 'pkill -f "next start"'
```

## 🌐 Настройка Nginx (опционально)

Для работы через порт 80 (http) или 443 (https):

### 1. Установите Nginx
```bash
ssh alexei@158.255.6.22
sudo apt update
sudo apt install nginx -y
```

### 2. Создайте конфигурацию
```bash
sudo nano /etc/nginx/sites-available/yodo
```

Вставьте:
```nginx
server {
    listen 80;
    server_name 158.255.6.22;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Активируйте конфигурацию
```bash
sudo ln -s /etc/nginx/sites-available/yodo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔥 Firewall настройки

```bash
# Разрешить порт 3000 (если нужен прямой доступ)
sudo ufw allow 3000

# Разрешить Nginx (если используете)
sudo ufw allow 'Nginx Full'

# Проверить статус
sudo ufw status
```

## 📊 Мониторинг

### Проверка использования ресурсов
```bash
ssh alexei@158.255.6.22 'htop'
```

### Проверка дискового пространства
```bash
ssh alexei@158.255.6.22 'df -h'
```

### Проверка памяти
```bash
ssh alexei@158.255.6.22 'free -m'
```

## 🆘 Решение проблем

### Приложение не запускается
1. Проверьте логи: `pm2 logs yodo-landing`
2. Проверьте, свободен ли порт: `sudo lsof -i :3000`
3. Проверьте наличие node_modules: `ls -la /home/alexei/yodo-marketplace/node_modules`

### Не хватает памяти
```bash
# Увеличьте swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Проблемы с правами доступа
```bash
ssh alexei@158.255.6.22
cd /home/alexei/yodo-marketplace
sudo chown -R alexei:alexei .
chmod -R 755 .
```

## ✅ Проверка деплоя

После деплоя проверьте:

1. **Доступность сайта:** http://158.255.6.22:3000
2. **Логи:** `pm2 logs yodo-landing`
3. **Статус:** `pm2 status`
4. **Все функции работают:**
   - Поиск специалистов
   - Навигация по категориям
   - AI-помощник (кнопка в правом нижнем углу)
   - Калькулятор стоимости
   - История поиска
   - Избранное

## 🎨 Новые функции после обновления

✅ Умный поиск с историей и автокомплитом
✅ Навигационные вкладки (Найти/Стать специалистом/Разместить)
✅ AI-помощник для консультаций
✅ Калькулятор стоимости услуг
✅ Секция "Часто ищут" (как на domclick.ru)
✅ Улучшенные карточки специалистов с промо
✅ Система избранного
✅ Адаптивная мобильная версия

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи
2. Перезапустите приложение
3. Проверьте доступность сервера
4. Убедитесь, что порт 3000 открыт

---

**Удачного деплоя! 🚀**

