// User controller file 
import { Request, Response } from 'express';
import { findOrCreateUser } from '../services/user.service';
import { User } from '../models/user.model';

export async function createUserController(req: Request, res: Response): Promise<User | void> {
    const { username } = req.body;
    if (!username || typeof username !== 'string') {
        res.status(400).json({ error: 'Username is required and must be a string' });
        return;
    }
    try {
        const { user, isNew } = await findOrCreateUser(username);
        res.status(201).json({
            ...user,
            message: isNew ? 'User created successfully' : 'User already exists'
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: error.message });
    }
}