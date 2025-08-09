# Movies App - Deployment Guide

Полнофункциональное приложение для управления фильмами с React TypeScript frontend и Node.js Express backend.

## 🚀 Деплой на Render

### Предварительные требования

1. Аккаунт на [Render.com](https://render.com)
2. Репозиторий проекта на GitHub

### Шаги деплоя

#### 1. Подготовка репозитория

```bash
# Убедитесь, что все файлы закоммичены
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

#### 2. Создание сервисов на Render

1. **Откройте [Render Dashboard](https://dashboard.render.com)**

2. **Создайте PostgreSQL базу данных:**
   - Нажмите "New +" → "PostgreSQL"
   - Name: `moviesapp-db`
   - Database Name: `moviesapp`
   - User: `moviesapp_user`
   - Region: выберите ближайший
   - Plan: Free
   - Нажмите "Create Database"

3. **Создайте Web Service (Backend API):**
   - Нажмите "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `moviesapp-api`
   - Region: тот же что и для БД
   - Branch: `main`
   - Root Directory: оставьте пустым
   - Runtime: Node
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Plan: Free

4. **Настройте Environment Variables для API:**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=[скопируйте External Database URL из настроек БД]
   ```

5. **Создайте Static Site (Frontend):**
   - Нажмите "New +" → "Static Site"
   - Connect your GitHub repository
   - Name: `moviesapp-frontend`
   - Branch: `main`
   - Root Directory: оставьте пустым
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`

6. **Настройте Environment Variables для Frontend:**
   ```
   VITE_API_URL=https://[your-api-service-url].onrender.com
   VITE_SERVER_URL=https://[your-api-service-url].onrender.com
   ```

#### 3. Автоматический деплой с render.yaml

Альтернативно, вы можете использовать файл `render.yaml` для автоматического деплоя:

1. Откройте [Render Dashboard](https://dashboard.render.com)
2. Нажмите "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render автоматически найдет `render.yaml` и создаст все необходимые сервисы

### Локальная разработка

#### Backend (Server)

```bash
cd server
npm install
npm run dev
```

#### Frontend (Client)

```bash
cd client
npm install
npm run dev
```

## 🏗️ Архитектура приложения

### Frontend (React + TypeScript)
- **React 19** с TypeScript
- **Redux Toolkit** для управления состоянием
- **Vite** для сборки
- **SCSS** для стилизации
- **Vitest** для тестирования

### Backend (Node.js + Express)
- **Express.js** сервер
- **TypeScript** для типизации
- **PostgreSQL** база данных
- **Multer** для загрузки файлов

### Архитектурные паттерны
- **Custom React Hooks** для переиспользования логики
- **Redux Slices** для управления состоянием
- **Layered Architecture** (Controller → Service → Data)
- **Single Responsibility Principle**

## 🗃️ База данных

### Схема
- `users` - пользователи
- `movies` - фильмы
- `favorites` - избранные фильмы (many-to-many)

### Ключевые особенности
- CASCADE удаление
- Оптимизированные индексы
- Параметризованные запросы

## 🧪 Тестирование

```bash
# Запуск тестов
cd client
npm test

# Покрытие тестов
npm run test:coverage
```

## 📁 Структура проекта

```
MoviesApp/
├── client/                 # React приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── hooks/          # Кастомные хуки
│   │   ├── store/          # Redux store
│   │   ├── services/       # API сервисы
│   │   └── types/          # TypeScript типы
│   └── dist/               # Сборка для production
├── server/                 # Node.js API
│   ├── src/
│   │   ├── controllers/    # Express контроллеры
│   │   ├── services/       # Бизнес логика
│   │   ├── routes/         # API роуты
│   │   └── database/       # БД конфигурация
│   └── dist/               # Скомпилированный JS
└── render.yaml             # Конфигурация Render
```

## 🔧 Конфигурация

### Environment Variables

#### Server
- `PORT` - порт сервера (default: 5000)
- `NODE_ENV` - окружение (development/production)
- `DATABASE_URL` - строка подключения к БД
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - параметры БД

#### Client
- `VITE_API_URL` - URL API сервера
- `VITE_SERVER_URL` - URL сервера

## 🚨 Troubleshooting

### Проблемы с деплоем
1. **Build fails**: Проверьте что все зависимости указаны в package.json
2. **Database connection**: Убедитесь что DATABASE_URL корректный
3. **CORS errors**: Проверьте что API URL правильно настроен в frontend

### Локальные проблемы
1. **Port conflicts**: Измените порт в .env файле
2. **Database issues**: Убедитесь что PostgreSQL запущен локально

## 📚 Дополнительная информация

- [Render Documentation](https://render.com/docs)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
