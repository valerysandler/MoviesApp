import { pool } from '../database/database';
import { Favorite } from '../models/favorite.model';
import { getUserIdByUsername } from './user.service';

// Check if movie is in favorites for a user
export async function checkFavoriteStatus(movieId: number, userId: string): Promise<boolean> {
  try {
    // Get numeric user ID
    const numericUserId = await getUserIdByUsername(userId);

    const query = `
      SELECT EXISTS(
        SELECT 1 FROM favorites 
        WHERE user_id = $1 AND movie_id = $2
      ) as is_favorite
    `;

    const result = await pool.query(query, [numericUserId, movieId]);
    return result.rows[0].is_favorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
}

// Add movie to favorites
export async function addToFavorites(movieId: number, userId: string): Promise<Favorite> {
  try {
    // Get numeric user ID
    const numericUserId = await getUserIdByUsername(userId);

    const query = `
      INSERT INTO favorites (user_id, movie_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, movie_id) DO NOTHING
      RETURNING *
    `;

    const result = await pool.query(query, [numericUserId, movieId]);
    return result.rows[0];
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

// Remove movie from favorites
export async function removeFromFavorites(movieId: number, userId: string): Promise<void> {
  try {
    // Get numeric user ID
    const numericUserId = await getUserIdByUsername(userId);

    const query = `
      DELETE FROM favorites 
      WHERE user_id = $1 AND movie_id = $2
    `;

    await pool.query(query, [numericUserId, movieId]);
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}

// Toggle favorite status
export async function toggleFavoriteStatus(movieId: number, userId: string): Promise<boolean> {
  try {
    const isFavorite = await checkFavoriteStatus(movieId, userId);

    if (isFavorite) {
      await removeFromFavorites(movieId, userId);
      return false;
    } else {
      await addToFavorites(movieId, userId);
      return true;
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
}

// Get all favorites for a user
export async function getUserFavorites(userId: string): Promise<any[]> {
  try {
    // Get numeric user ID
    const numericUserId = await getUserIdByUsername(userId);

    const query = `
      SELECT m.*, f.created_at as favorited_at
      FROM movies m
      INNER JOIN favorites f ON m.id = f.movie_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;

    const result = await pool.query(query, [numericUserId]);
    return result.rows;
  } catch (error) {
    console.error('Error getting user favorites:', error);
    throw error;
  }
}
