import { Request, Response } from "express";
import { Movie } from "../models/movie.model";
import {
    searchMovies,
    getMovieDetails,
    getMoviesFromDatabase,
    addMovieToDatabase,
    updateMovieFavoriteStatus,
    deleteMovieFromDatabase
} from "../services/movies.service";

// Get movies from https://www.omdbapi.com/ AJAX request
export async function searchMoviesController(req: Request, res: Response): Promise<Movie[] | void> {
    // Support both query parameter (?title=batman) and path parameter (/search/batman)
    const title = req.query.title as string || req.params.title as string;
    console.log('getMoviesController called with title:', title);
    if (!title || typeof title !== 'string') {
        res.status(400).json({ error: 'Title is required and must be a string' });
        return;
    }
    try {
        const searchResults = await searchMovies(title);
        if (!searchResults || searchResults.length === 0) {
            res.status(404).json({ error: 'No movies found' });
            return;
        }

        const movieDetailsPromises = searchResults.map((movie: any) =>
            getMovieDetails(movie.imdbID)
        );

        const detailedMovies = await Promise.all(movieDetailsPromises);
        const movies: Movie[] = detailedMovies.map((movie: any) => ({
            id: Math.floor(Math.random() * 1000), // Mock ID
            user_id: 0, // Will be set when user saves the movie
            title: movie.Title,
            year: movie.Year,
            runtime: movie.Runtime,
            genre: movie.Genre,
            poster: movie.Poster,
            director: movie.Director,
            external_id: movie.imdbID,
            is_favorite: false
        }));

        res.status(200).json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Get movies from postgres database 
export async function getMoviesController(req: Request, res: Response): Promise<Movie[] | void> {
    try {
        // Here you would typically fetch movies from your database
        // For now, we return an empty array as a placeholder
        const movies = await getMoviesFromDatabase();
        res.status(200).json(movies);
    } catch (error: any) {
        console.error('Error fetching movies from database:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Add movie to database
export async function addMovieController(req: Request, res: Response): Promise<void> {
    try {
        const movieData: Omit<Movie, 'id'> = req.body;
        const imageFile = req.file;

        // Validate required fields
        if (!movieData.title) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }
        if (!movieData.user_id) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        let posterPath: string | undefined = undefined;
        if (imageFile) {
            posterPath = `/uploads/posters/${imageFile.filename}`;
        }

        const newMovie = await addMovieToDatabase({
            ...movieData,
            poster_local: posterPath,
            user_id: movieData.user_id || 1, // default user
            is_favorite: movieData.is_favorite || false
        });
        res.status(201).json(newMovie);
    } catch (error) {
        console.error('Error adding movie to database:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}

// Update movie favorite status
export async function updateMovieFavoriteController(req: Request, res: Response): Promise<void> {
    try {
        const movieId = parseInt(req.params.id);
        const { is_favorite } = req.body;

        if (isNaN(movieId)) {
            res.status(400).json({ error: 'Invalid movie ID' });
            return;
        }

        if (typeof is_favorite !== 'boolean') {
            res.status(400).json({ error: 'is_favorite must be a boolean' });
            return;
        }

        const updatedMovie = await updateMovieFavoriteStatus(movieId, is_favorite);
        res.status(200).json(updatedMovie);
    } catch (error) {
        console.error('Error updating movie favorite status:', error);
        if (error instanceof Error && error.message === 'Movie not found') {
            res.status(404).json({ error: 'Movie not found' });
        } else {
            res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}

// Delete movie from database
export async function deleteMovieController(req: Request, res: Response): Promise<void> {
    try {
        const movieId = parseInt(req.params.id);

        if (isNaN(movieId)) {
            res.status(400).json({ error: 'Invalid movie ID' });
            return;
        }

        const deleted = await deleteMovieFromDatabase(movieId);

        if (deleted) {
            res.status(200).json({ message: 'Movie deleted successfully' });
        } else {
            res.status(404).json({ error: 'Movie not found' });
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
