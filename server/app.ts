import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import { initializeDatabase, testConnection } from './src/database/database'; // Updated import
import userRoute from './src/routes/user.route'; // Import user routes
import moviesRoute from './src/routes/movies.route'; // Import movies routes
import favoritesRoute from './src/routes/favorites.route'; // Import favorites routes


// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('combined')); // Use morgan for logging HTTP requests

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
app.use('/api/users', userRoute); // Use user routes
app.use('/api/movies/favorites', favoritesRoute); // Use favorites routes 
app.use('/api/movies', moviesRoute); // Use movies routes

app.get('/', (_req, res) => {
  res.send('API is running');
});

// Initialize database and start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();

    // Initialize database tables
    await initializeDatabase();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
