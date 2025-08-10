# Movies App - Deployment Guide

A full-featured movie management application with React TypeScript frontend and Node.js Express backend.

## 🚀 Deploy to Render

### Prerequisites

1. Account on [Render.com](https://render.com)
2. Project repository on GitHub

### Deployment Steps

#### 1. Repository Preparation

```bash
# Make sure all files are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

#### 2. Creating Services on Render

1. **Open [Render Dashboard](https://dashboard.render.com)**

2. **Create PostgreSQL Database:**

   - Click "New +" → "PostgreSQL"
   - Name: `moviesapp-db`
   - Database Name: `moviesapp`
   - User: `moviesapp_user`
   - Region: choose the closest one
   - Plan: Free
   - Click "Create Database"

3. **Create Web Service (Backend API):**

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `moviesapp-api`
   - Region: same as database
   - Branch: `main`
   - Root Directory: leave empty
   - Runtime: Node
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Plan: Free

4. **Configure Environment Variables for API:**

   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=[copy External Database URL from database settings]
   ```

5. **Create Static Site (Frontend):**

   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Name: `moviesapp-frontend`
   - Branch: `main`
   - Root Directory: leave empty
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`

6. **Configure Environment Variables for Frontend:**
   ```
   VITE_API_URL=https://[your-api-service-url].onrender.com
   VITE_SERVER_URL=https://[your-api-service-url].onrender.com
   ```

#### 3. Automatic Deployment with render.yaml

Alternatively, you can use the `render.yaml` file for automatic deployment:

1. Open [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically find `render.yaml` and create all necessary services

### Local Development

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

## 🏗️ Application Architecture

### Frontend (React + TypeScript)

- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **Vite** for build tooling
- **SCSS** for styling
- **Vitest** for testing

### Backend (Node.js + Express)

- **Express.js** server
- **TypeScript** for type safety
- **PostgreSQL** database
- **Multer** for file uploads

### Architectural Patterns

- **Custom React Hooks** for logic reuse
- **Redux Slices** for state management
- **Layered Architecture** (Controller → Service → Data)
- **Single Responsibility Principle**

## 🗃️ Database

### Schema

- `users` - user accounts
- `movies` - movie records
- `favorites` - favorite movies (many-to-many)

### Key Features

- CASCADE deletion
- Optimized indexes
- Parameterized queries

## 🧪 Testing

```bash
# Run tests
cd client
npm test

# Test coverage
npm run test:coverage
```

## 📁 Project Structure

```
MoviesApp/
├── client/                 # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── dist/               # Production build
├── server/                 # Node.js API
│   ├── src/
│   │   ├── controllers/    # Express controllers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   └── database/       # Database configuration
│   └── dist/               # Compiled JavaScript
└── render.yaml             # Render configuration
```

## 🔧 Configuration

### Environment Variables

#### Server

- `PORT` - server port (default: 5000)
- `NODE_ENV` - environment (development/production)
- `DATABASE_URL` - database connection string
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - database parameters

#### Client

- `VITE_API_URL` - API server URL
- `VITE_SERVER_URL` - server URL

## 🚨 Troubleshooting

### Deployment Issues

1. **Build fails**: Check that all dependencies are listed in package.json
2. **Database connection**: Ensure DATABASE_URL is correct
3. **CORS errors**: Verify API URL is properly configured in frontend

### Local Issues

1. **Port conflicts**: Change port in .env file
2. **Database issues**: Make sure PostgreSQL is running locally

## 📚 Additional Information

- [Render Documentation](https://render.com/docs)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
