import { Router } from 'express';
import {
  checkFavorite,
  toggleFavorite,
  getFavorites
} from '../controllers/favorites.controller';

const router = Router();

// GET /api/favorites/check?movieId=1&userId=john - Check if movie is favorite
router.get('/check', checkFavorite);

// POST /api/favorites/toggle - Toggle favorite status
router.post('/toggle', toggleFavorite);

// GET /api/favorites/:userId - Get user's favorites
router.get('/:userId', getFavorites);

export default router;
