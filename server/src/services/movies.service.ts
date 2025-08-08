import axios from "axios";
import { Movie } from "../models/movie.model";
import { pool } from "../database/database";



const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Get movies from database postgres
export async function getMoviesFromDatabase(): Promise<Movie[]> {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                user_id,
                title,
                year,
                runtime,
                poster,
                poster_local,
                genre,
                director,
                external_id,
                is_favorite
            FROM movies 
            ORDER BY created_at DESC
        `);

        return result.rows as Movie[];
    } catch (error) {
        console.error('Error fetching movies from database:', error);
        throw new Error('Internal server error');
    }
}

// Add movie to database
// В movies.service.ts обновить SQL запросы
export async function addMovieToDatabase(movie: Omit<Movie, 'id'>): Promise<Movie> {
    try {
        const result = await pool.query(`
      INSERT INTO movies (
        user_id, title, year, runtime, poster, poster_local, 
        genre, director, external_id, is_favorite
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
            movie.user_id,
            movie.title,
            movie.year,
            movie.runtime,
            movie.poster,
            movie.poster_local,  // новое поле
            movie.genre,
            movie.director,
            movie.external_id,
            movie.is_favorite
        ]);

        return result.rows[0] as Movie;
    } catch (error) {
        console.error('Error adding movie to database:', error);
        throw new Error('Internal server error');
    }
}

// Get movie by ID
export async function getMovieById(id: number): Promise<Movie | null> {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                user_id,
                title,
                year,
                runtime,
                poster,
                poster_local,
                genre,
                director,
                external_id,
                is_favorite
            FROM movies 
            WHERE id = $1
        `, [id]);
        return result.rows[0] as Movie || null;
    } catch (error) {
        console.error('Error fetching movie by id:', error);
        throw new Error('Internal server error');
    }
}

// Update movie favorite status
export async function updateMovieFavoriteStatus(id: number, is_favorite: boolean): Promise<Movie> {
    try {
        const result = await pool.query(`
            UPDATE movies 
            SET is_favorite = $1, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $2 
            RETURNING 
                id,
                user_id,
                title,
                year,
                runtime,
                poster,
                poster_local,
                genre,
                director,
                external_id,
                is_favorite
        `, [is_favorite, id]);

        if (result.rows.length === 0) {
            throw new Error('Movie not found');
        }

        return result.rows[0] as Movie;
    } catch (error) {
        console.error('Error updating movie favorite status:', error);
        throw new Error('Internal server error');
    }
}

// Delete movie from database
export async function deleteMovieFromDatabase(id: number): Promise<boolean> {
    try {
        const result = await pool.query('DELETE FROM movies WHERE id = $1', [id]);
        return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
        console.error('Error deleting movie from database:', error);
        throw new Error('Internal server error');
    }
}

export async function searchMovies(title: string) {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: OMDB_API_KEY,
            s: title,
            type: 'movie', // фильтруем по фильмам
        },
    });
    if (response.data.Response === 'False') {
        throw new Error(response.data.Error);
    }
    return response.data.Search;
}

export async function getMovieDetails(imdbID: string) {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: OMDB_API_KEY,
            i: imdbID,
        },
    });
    if (response.data.Response === 'False') {
        throw new Error(response.data.Error);
    }
    return response.data;
}