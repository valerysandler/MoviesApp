// routes/userRoutes.ts
import express from 'express';
import { findOrCreateUser } from '../services/user.service';
import { createUserController } from '../controllers/user.controller';

const router = express.Router();

router.post('/', createUserController);

export default router;
