# Manual Render Deployment Instructions

If the render.yaml Blueprint fails, create services manually:

## 1. Create PostgreSQL Database

- Go to Render Dashboard
- Click "New +" → "PostgreSQL"
- Name: `moviesapp-db`
- Database Name: `moviesapp`
- User: `moviesapp_user`
- Plan: Free
- Click "Create Database"
- **Copy the External Database URL** for later use

## 2. Create Backend Web Service

- Click "New +" → "Web Service"
- Connect your GitHub repository: `MoviesApp`
- Name: `moviesapp-api`
- Environment: `Node`
- Region: Same as database
- Branch: `main`
- Root Directory: (leave empty)
- Build Command: `cd server && npm install && npm run build`
- Start Command: `cd server && npm start`
- Plan: Free

### Environment Variables for Backend:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=[paste the External Database URL from step 1]
```

## 3. Create Frontend Static Site

- Click "New +" → "Static Site"
- Connect your GitHub repository: `MoviesApp`
- Name: `moviesapp-frontend`
- Branch: `main`
- Root Directory: (leave empty)
- Build Command: `cd client && npm install && npm run build`
- Publish Directory: `client/dist`

### Environment Variables for Frontend:

```
VITE_API_URL=https://moviesapp-api.onrender.com
VITE_SERVER_URL=https://moviesapp-api.onrender.com
```

**Note**: Replace `moviesapp-api` with your actual backend service URL once it's created.

## 4. Verification

1. Backend should be accessible at: `https://moviesapp-api.onrender.com/`
2. Frontend should be accessible at: `https://moviesapp-frontend.onrender.com/`
3. Check logs if any service fails to start

## 5. Common Issues

- **Build failures**: Check that package.json has all required dependencies
- **Database connection**: Verify DATABASE_URL is correct
- **CORS errors**: Ensure API URL is properly set in frontend environment variables
