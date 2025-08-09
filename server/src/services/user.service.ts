import { pool } from '../database/database';
import { User } from '../models/user.model';

// This service handles user-related database operations
export async function findUserByUsername(username: string): Promise<User | null> {
    try {
        const res = await pool.query('SELECT * FROM public.users WHERE username = $1', [username]);
        return res.rows[0] || null;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
}

// Create a new user in the database
export async function createUser(username: string): Promise<User> {
    const res = await pool.query('INSERT INTO users (username) VALUES ($1) RETURNING *', [username]);
    return res.rows[0];
}

// Find or create a user by username
export async function findOrCreateUser(username: string): Promise<{ user: User; isNew: boolean }> {
    let user = await findUserByUsername(username);
    let isNew = false;
    if (!user) {
        user = await createUser(username);
        isNew = true;
    }
    return { user, isNew };
}

// Get user ID by username (for internal use)
export async function getUserIdByUsername(username: string): Promise<number> {
    const user = await findUserByUsername(username);
    if (!user) {
        // If user doesn't exist, create them
        const newUser = await createUser(username);
        return newUser.id;
    }
    return user.id;
}
