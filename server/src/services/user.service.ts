import { pool } from '../database/database';
import { User } from '../models/user.model';

export async function findUserByUsername(username: string): Promise<User | null> {
    console.log('findUserByUsername called with:', username);
    try {
        const res = await pool.query('SELECT * FROM public.users WHERE username = $1', [username]);
        console.log('Result:', res.rows);
        return res.rows[0] || null;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
} 



export async function createUser(username: string): Promise<User> {
    const res = await pool.query('INSERT INTO users (username) VALUES ($1) RETURNING *', [username]);
    return res.rows[0];
}

export async function findOrCreateUser(username: string): Promise<User> {
    let user = await findUserByUsername(username);
    if (!user) {
        user = await createUser(username);
    }
    return user;
}
