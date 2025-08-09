import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Database configuration with environment variables
const dbConfig = {
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'movies',
  password: process.env.DB_PASSWORD || 'admin',
  port: parseInt(process.env.DB_PORT || '5432'),
  // SSL configuration for production (Render requires SSL)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Alternative: Use DATABASE_URL if provided (common on Render)
const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? { connectionString, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false }
    : dbConfig
);

// Function to initialize database tables
export async function initializeDatabase(): Promise<void> {
  try {
    const sqlPath = join(__dirname, 'init.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    await pool.query(sql);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Test database connection
export async function testConnection(): Promise<void> {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Database connected successfully at:', result.rows[0].now);
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}
