import { pool } from '../database/database';
import { Favorite } from '../models/favorite.model';
import { getUserIdByUsername } from './user.service';

// Check if movie is in favorites for a user
export async function checkFavoriteStatus(movieId: number, username: string): Promise<boolean> {
  try {
    // Get numeric user ID
    const numericUserId = await getUserIdByUsername(username);

    const query = `
      SELECT EXISTS(
        SELECT 1 FROM favorites 
        WHERE user_id = $1 AND movie_id = $2
      ) as is_favorite
    `;

    const result = await pool.query(query, [numericUserId, movieId]);
    return result.rows[0].is_favorite;
  } catch (error) {
    throw new Error('Database error');
  }
}

// Add movie to favorites
export async function addToFavorites(movieId: number, username: string): Promise<Favorite> {
  try {
    // Get numeric user ID
    const numericUserId = await getUserIdByUsername(username);

    const query = `
      INSERT INTO favorites (user_id, movie_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, movie_id) DO NOTHING
      RETURNING *
    `;

    const result = await pool.query(query, [numericUserId, movieId]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

// Remove movie from favorites
export async function removeFromFavorites(movieId: number, username: string): Promise<void> {
  try {
    // Get numeric user ID
    const numericUserId = await getUserIdByUsername(username);

    const query = `
      DELETE FROM favorites 
      WHERE user_id = $1 AND movie_id = $2
    `;

    await pool.query(query, [numericUserId, movieId]);
  } catch (error) {
    throw error;
  }
}

// Toggle movie in favorites for a user (add if not present, remove if present)
export async function toggleFavorite(movieId: number, username: string): Promise<{ action: 'added' | 'removed', isInFavorites: boolean }> {
  try {
    // Get numeric user ID
    const numericUserId = await getUserIdByUsername(username);

    // Check if already in favorites
    const isCurrentlyFavorite = await checkFavoriteStatus(movieId, username);

    if (isCurrentlyFavorite) {
      // Remove from favorites
      await removeFromFavorites(movieId, username);
      return { action: 'removed', isInFavorites: false };
    } else {
      // Add to favorites
      await addToFavorites(movieId, username);
      return { action: 'added', isInFavorites: true };
    }
  } catch (error) {
    throw error;
  }
}

// Get all favorites for a user
export async function getUserFavorites(username: string): Promise<any[]> {
  try {
    // Get numeric user ID
    const numericUserId = await getUserIdByUsername(username);

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
    throw error;
  }
}
