import { Request, Response } from "express";
import { Movie } from "../models/movie.model";
import { searchMovies, getMovieDetails } from "../services/movis.service";

// Get movies from https://www.omdbapi.com/ AJAX request
export async function getMoviesController(req: Request, res: Response): Promise<Movie[] | void> {
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