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
let connectionString = process.env.DATABASE_URL;

// Force SSL for Render if DATABASE_URL doesn't include sslmode
if (connectionString && process.env.NODE_ENV === 'production') {
  if (!connectionString.includes('sslmode=')) {
    connectionString += connectionString.includes('?') ? '&sslmode=require' : '?sslmode=require';
  }
}

// Debug logging for production
if (process.env.NODE_ENV === 'production') {

  if (connectionString) {
    // Show first part of connection string for debugging (hide password)
    const urlParts = connectionString.split('@');
  }
}

export const pool = new Pool(
  connectionString
    ? {
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    }
    : dbConfig
);

export async function initializeDatabase() {
  try {
    const sqlScript = readFileSync(join(__dirname, 'init.sql'), 'utf8');
    await pool.query(sqlScript);
  } catch (error) {
    throw error;
  }
}

export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}
