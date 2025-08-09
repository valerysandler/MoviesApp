/**
 * Clean and well-structured Movie Service
 * Handles all movie-related API operations
 */

import { httpClient } from '../utils/http';
import { validateMovie, sanitizeMovieData } from '../utils/validation';
import { validateImageFile } from '../utils/imageUtils';
import { logError } from '../utils/errors';
import { API_CONFIG } from '../config/constants';
import type {
    Movie,
    MovieFormData,
    CreateMovieRequest,
    ToggleFavoriteRequest
} from '../types';

export class MovieService {
    private readonly endpoints = API_CONFIG.ENDPOINTS;

    /**
     * Fetch all movies from the database
     */
    async getAllMovies(): Promise<Movie[]> {
        try {
            const movies = await httpClient.get<Movie[]>(this.endpoints.MOVIES);
            return movies;
        } catch (error) {
            logError(error, 'MovieService.getAllMovies');
            throw error;
        }
    }

    /**
     * Search for movies by title
     */
    async searchMovies(query: string): Promise<Movie[]> {
        if (!query.trim()) {
            return [];
        }

        try {
            const encodedQuery = encodeURIComponent(query.trim());
            const movies = await httpClient.get<Movie[]>(
                `${this.endpoints.SEARCH}?title=${encodedQuery}`
            );
            return movies;
        } catch (error) {
            logError(error, 'MovieService.searchMovies');
            throw error;
        }
    }

    /**
     * Get a specific movie by ID
     */
    async getMovieById(movieId: number): Promise<Movie> {
        try {
            const movie = await httpClient.get<Movie>(`${this.endpoints.MOVIES}/${movieId}`);
            return movie;
        } catch (error) {
            logError(error, 'MovieService.getMovieById');
            throw error;
        }
    }

    /**
     * Create a new movie with image upload
     */
    async createMovieWithImage(
        movieData: MovieFormData,
        imageFile: File,
        userId: string
    ): Promise<Movie> {
        // Validate inputs
        validateMovie(movieData);
        validateImageFile(imageFile);

        const sanitizedData = sanitizeMovieData(movieData);
        const formData = this.createFormData(sanitizedData, userId, imageFile);

        try {
            const movie = await httpClient.post<Movie>(this.endpoints.MOVIES, formData);
            return movie;
        } catch (error) {
            logError(error, 'MovieService.createMovieWithImage');
            throw error;
        }
    }

    /**
     * Create a new movie without image (e.g., from search results)
     */
    async createMovie(movieData: MovieFormData, userId: string): Promise<Movie> {
        validateMovie(movieData);

        const sanitizedData = sanitizeMovieData(movieData);
        const requestData: CreateMovieRequest = {
            ...sanitizedData,
            user_id: userId
        };

        try {
            const movie = await httpClient.post<Movie>(this.endpoints.MOVIES, requestData);
            return movie;
        } catch (error) {
            logError(error, 'MovieService.createMovie');
            throw error;
        }
    }

    /**
     * Update an existing movie without changing the image
     */
    async updateMovie(movieData: Movie): Promise<Movie> {
        validateMovie(movieData);

        try {
            const movie = await httpClient.put<Movie>(
                `${this.endpoints.MOVIES}/${movieData.id}`,
                movieData
            );
            return movie;
        } catch (error) {
            logError(error, 'MovieService.updateMovie');
            throw error;
        }
    }

    /**
     * Update an existing movie with new image
     */
    async updateMovieWithImage(
        movieData: Movie,
        imageFile: File
    ): Promise<Movie> {
        validateMovie(movieData);
        validateImageFile(imageFile);

        const formData = this.createFormData(movieData, movieData.user_id?.toString(), imageFile);

        try {
            const movie = await httpClient.put<Movie>(
                `${this.endpoints.MOVIES}/${movieData.id}`,
                formData
            );
            return movie;
        } catch (error) {
            logError(error, 'MovieService.updateMovieWithImage');
            throw error;
        }
    }

    /**
     * Delete a movie
     */
    async deleteMovie(movieId: number): Promise<void> {
        try {
            await httpClient.delete<void>(`${this.endpoints.MOVIES}/${movieId}`);
        } catch (error) {
            logError(error, 'MovieService.deleteMovie');
            throw error;
        }
    }

    /**
     * Toggle favorite status for a movie
     */
    async toggleFavorite(movieId: number, userId: string): Promise<boolean> {
        const requestData: ToggleFavoriteRequest = { movieId, userId };

        try {
            const response = await httpClient.post<{ isFavorite: boolean }>(
                `${this.endpoints.FAVORITES}/toggle`,
                requestData
            );
            return response.isFavorite;
        } catch (error) {
            logError(error, 'MovieService.toggleFavorite');
            throw error;
        }
    }

    /**
     * Check if a movie is in user's favorites
     */
    async checkFavoriteStatus(movieId: number, userId: string): Promise<boolean> {
        try {
            const response = await httpClient.get<{ isFavorite: boolean }>(
                `${this.endpoints.FAVORITES}/check?movieId=${movieId}&userId=${userId}`
            );
            return response.isFavorite;
        } catch (error) {
            logError(error, 'MovieService.checkFavoriteStatus');
            throw error;
        }
    }

    /**
     * Check if a movie with the given title already exists
     */
    async checkMovieExists(title: string): Promise<boolean> {
        if (!title.trim()) {
            return false;
        }

        try {
            const response = await httpClient.get<{ exists: boolean }>(
                `${this.endpoints.MOVIES}/check-exists?title=${encodeURIComponent(title.trim())}`
            );
            return response.exists;
        } catch (error) {
            logError(error, 'MovieService.checkMovieExists');
            throw error;
        }
    }

    /**
     * Get all movies with favorite status for a specific user
     */
    async getMoviesWithFavoriteStatus(userId: string): Promise<Movie[]> {
        try {
            const movies = await this.getAllMovies();

            const moviesWithFavorites = await Promise.all(
                movies.map(async (movie) => {
                    try {
                        const isFavorite = await this.checkFavoriteStatus(movie.id, userId);
                        return { ...movie, is_favorite: isFavorite };
                    } catch (error) {
                        logError(error, `MovieService.getMoviesWithFavoriteStatus for movie ${movie.id}`);
                        return { ...movie, is_favorite: false };
                    }
                })
            );

            return moviesWithFavorites;
        } catch (error) {
            logError(error, 'MovieService.getMoviesWithFavoriteStatus');
            throw error;
        }
    }

    /**
     * Private helper to create FormData for file uploads
     */
    private createFormData(
        movieData: Partial<Movie>,
        userId?: string,
        imageFile?: File
    ): FormData {
        const formData = new FormData();

        // Add movie data
        if (movieData.title) formData.append('title', movieData.title);
        if (movieData.year) formData.append('year', movieData.year);
        if (movieData.genre) formData.append('genre', movieData.genre);
        if (movieData.runtime) formData.append('runtime', movieData.runtime);
        if (movieData.director) formData.append('director', movieData.director);
        if (userId) formData.append('user_id', userId);

        // Add image file
        if (imageFile) {
            formData.append('poster', imageFile);
        }

        return formData;
    }
}

// Export singleton instance
export const movieService = new MovieService();

// For backward compatibility, export individual functions
export const searchMovies = (query: string) => movieService.searchMovies(query);
export const fetchMovies = () => movieService.getAllMovies();
export const addMovieWithImage = (movie: MovieFormData, file: File, userId: string) =>
    movieService.createMovieWithImage(movie, file, userId);
export const addMovieToDatabase = (movie: MovieFormData, userId: string) =>
    movieService.createMovie(movie, userId);
export const updateMovie = (movie: Movie) => movieService.updateMovie(movie);
export const updateMovieWithImage = (movie: Movie, file: File) =>
    movieService.updateMovieWithImage(movie, file);
export const deleteMovie = (movieId: number) => movieService.deleteMovie(movieId);
export const getMovieById = (movieId: number) => movieService.getMovieById(movieId);
export const toggleFavorite = (movieId: number, userId: string) =>
    movieService.toggleFavorite(movieId, userId);
export const checkFavoriteStatus = (movieId: number, userId: string) =>
    movieService.checkFavoriteStatus(movieId, userId);
export const checkMovieExists = (title: string) => movieService.checkMovieExists(title);
export const getMoviesWithFavoriteStatus = (userId: string) =>
    movieService.getMoviesWithFavoriteStatus(userId);
