import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

export const pool = new Pool({
  user: 'admin',
  host: 'localhost',
  database: 'movies',
  password: 'admin',
  port: 5432,
});

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
