import { Request, Response } from 'express';
import {
  checkFavoriteStatus,
  toggleFavoriteStatus,
  getUserFavorites
} from '../services/favorites.service';

// Check if movie is in favorites
export async function checkFavorite(req: Request, res: Response) {
  try {
    const { movieId, userId } = req.query;

    if (!movieId || !userId) {
      return res.status(400).json({ error: 'Missing movieId or userId' });
    }

    const isFavorite = await checkFavoriteStatus(Number(movieId), String(userId));
    res.json({ isFavorite });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Toggle favorite status
export async function toggleFavorite(req: Request, res: Response) {
  try {
    const { movieId, userId } = req.body;

    if (!movieId || !userId) {
      return res.status(400).json({ error: 'Missing movieId or userId' });
    }

    const isFavorite = await toggleFavoriteStatus(Number(movieId), String(userId));
    res.json({ isFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get user favorites
export async function getFavorites(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const favorites = await getUserFavorites(String(userId));
    res.json(favorites);
  } catch (error) {
    console.error('Error getting favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
