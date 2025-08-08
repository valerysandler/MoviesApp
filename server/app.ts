import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { pool } from './src/database/database'; // Adjust the import path as necessary
import userRoute from './src/routes/user.route'; // Import user routes


// Initialize the database connection
pool.connect()
    .then(() => console.log(`Database ${process.env.DB_NAME} connected successfully`))
    .catch(err => console.error('Database connection error:', err));

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import routes
app.use('/api/users', userRoute); // Use user routes


app.get('/', (_req, res) => {
  res.send('API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
