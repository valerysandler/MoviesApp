import { Request, Response } from "express";
import { Movie } from "../models/movie.model";
import {
    searchMovies,
    getMovieDetails,
    getMoviesFromDatabase,
    addMovieToDatabase,
    updateMovieFavoriteStatus,
    deleteMovieFromDatabase,
    checkMovieExists,
    updateMovieInDatabase,
    getMovieById
} from "../services/movies.service";
import { getUserIdByUsername } from "../services/user.service";

export async function searchMoviesController(req: Request, res: Response): Promise<Movie[] | void> {
    const title = req.query.title as string || req.params.title as string;
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
            id: Math.floor(Math.random() * 1000),
            user_id: 0,
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
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getMoviesController(req: Request, res: Response): Promise<Movie[] | void> {
    try {
        const movies = await getMoviesFromDatabase();
        res.status(200).json(movies);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
}

export async function addMovieController(req: Request, res: Response): Promise<void> {
    try {
        const movieData: Omit<Movie, 'id'> = req.body;
        const imageFile = req.file;

        if (!movieData.title) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }

        let userId: number;
        if (typeof movieData.user_id === 'string' && isNaN(Number(movieData.user_id))) {
            userId = await getUserIdByUsername(movieData.user_id);
        } else if (movieData.user_id) {
            userId = Number(movieData.user_id);
        } else {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        let posterPath: string | undefined = undefined;
        if (imageFile) {
            posterPath = imageFile.path;
        }

        const movie: Omit<Movie, 'id'> = {
            ...movieData,
            user_id: userId,
            poster_local: posterPath || null
        };

        const newMovie = await addMovieToDatabase(movie);
        res.status(201).json(newMovie);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add movie' });
    }
}

export async function updateMovieFavoriteController(req: Request, res: Response): Promise<void> {
    try {
        const movieId = parseInt(req.params.id);
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const isFavorite = await updateMovieFavoriteStatus(movieId, userId);
        res.status(200).json({ isFavorite });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update favorite status' });
    }
}

export async function deleteMovieController(req: Request, res: Response): Promise<void> {
    try {
        const movieId = parseInt(req.params.id);

        if (!movieId || isNaN(movieId)) {
            res.status(400).json({ error: 'Invalid movie ID' });
            return;
        }

        await deleteMovieFromDatabase(movieId);
        res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete movie' });
    }
}

export async function checkMovieExistsController(req: Request, res: Response): Promise<void> {
    try {
        const title = req.query.title as string;

        if (!title) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }

        const exists = await checkMovieExists(title);
        res.status(200).json({ exists });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check movie existence' });
    }
}

export async function updateMovieController(req: Request, res: Response): Promise<void> {
    try {
        const movieId = parseInt(req.params.id);
        const movieData: Partial<Movie> = req.body;
        const imageFile = req.file;

        if (!movieId || isNaN(movieId)) {
            res.status(400).json({ error: 'Invalid movie ID' });
            return;
        }

        if (!movieData.title) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }

        const existingMovie = await getMovieById(movieId);
        if (!existingMovie) {
            res.status(404).json({ error: 'Movie not found' });
            return;
        }

        let posterPath: string | null = existingMovie.poster_local;

        if (imageFile) {
            posterPath = imageFile.path;
        }

        const updatedMovieData = {
            ...movieData,
            id: movieId,
            poster_local: posterPath
        };

        const updatedMovie = await updateMovieInDatabase(updatedMovieData as Movie);
        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update movie' });
    }
}

export async function getMovieByIdController(req: Request, res: Response): Promise<void> {
    try {
        const movieId = parseInt(req.params.id);

        if (!movieId || isNaN(movieId)) {
            res.status(400).json({ error: 'Invalid movie ID' });
            return;
        }

        const movie = await getMovieById(movieId);
        if (!movie) {
            res.status(404).json({ error: 'Movie not found' });
            return;
        }

        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch movie' });
    }
}
