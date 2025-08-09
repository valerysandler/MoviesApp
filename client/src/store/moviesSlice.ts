import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Movie } from '../types';
import { movieService } from '../services/movieServiceClean';
import { logError } from '../utils/errors';

interface MoviesState {
    movies: Movie[];
    searchResults: Movie[];
    isLoading: boolean;
    error: string | null;
    isSearching: boolean;
    favorites: { [movieId: number]: boolean }; // Local cache of favorite statuses
}

export type { MoviesState };

// Helper function to load favorites from localStorage
const loadFavoritesFromStorage = (): { [movieId: number]: boolean } => {
    try {
        const savedFavorites = localStorage.getItem('movieFavorites');
        return savedFavorites ? JSON.parse(savedFavorites) : {};
    } catch (error) {
        console.error('Failed to load favorites from localStorage:', error);
        return {};
    }
};

// Helper function to save favorites to localStorage
const saveFavoritesToStorage = (favorites: { [movieId: number]: boolean }) => {
    try {
        localStorage.setItem('movieFavorites', JSON.stringify(favorites));
    } catch (error) {
        console.error('Failed to save favorites to localStorage:', error);
    }
};

const initialState: MoviesState = {
    movies: [],
    searchResults: [],
    isLoading: false,
    error: null,
    isSearching: false,
    favorites: loadFavoritesFromStorage(),
};

// Async thunks
export const fetchMoviesAsync = createAsyncThunk(
    'movies/fetchMovies',
    async (_, { rejectWithValue, getState }) => {
        try {
            const response = await movieService.getAllMovies();
            const state = getState() as { movies: MoviesState };
            const localFavorites = state.movies.favorites;

            // Apply local favorite status to movies
            const moviesWithFavorites = response.map(movie => ({
                ...movie,
                is_favorite: localFavorites[movie.id] || false
            }));

            return moviesWithFavorites;
        } catch (error) {
            logError(error, 'fetchMoviesAsync');
            return rejectWithValue('Failed to fetch movies');
        }
    }
);

// New thunk to sync favorites with server
export const syncFavoritesAsync = createAsyncThunk(
    'movies/syncFavorites',
    async (userId: string, { rejectWithValue, getState }) => {
        try {
            const state = getState() as { movies: MoviesState };
            const localFavorites = state.movies.favorites;
            const movies = state.movies.movies;

            // Sync each favorite status with server
            const syncPromises = movies.map(async (movie) => {
                if (localFavorites[movie.id] !== undefined) {
                    try {
                        const serverStatus = await movieService.checkFavoriteStatus(movie.id, userId);
                        return { movieId: movie.id, serverStatus, localStatus: localFavorites[movie.id] };
                    } catch (error) {
                        logError(error, `syncFavoritesAsync for movie ${movie.id}`);
                        return null;
                    }
                }
                return null;
            });

            const syncResults = await Promise.all(syncPromises);
            const validResults = syncResults.filter(result => result !== null);

            return validResults;
        } catch (error) {
            logError(error, 'syncFavoritesAsync');
            return rejectWithValue('Failed to sync favorites');
        }
    }
);

export const toggleFavoriteAsync = createAsyncThunk(
    'movies/toggleFavorite',
    async ({ movieId, userId }: { movieId: number; userId: string }, { rejectWithValue }) => {
        try {
            const newFavoriteStatus = await movieService.toggleFavorite(movieId, userId);
            return { movieId, isFavorite: newFavoriteStatus };
        } catch (error) {
            logError(error, 'toggleFavoriteAsync');
            return rejectWithValue('Failed to toggle favorite');
        }
    }
);

export const deleteMovieAsync = createAsyncThunk(
    'movies/deleteMovie',
    async (movieId: number, { rejectWithValue }) => {
        try {
            await movieService.deleteMovie(movieId);
            return movieId;
        } catch (error) {
            logError(error, 'deleteMovieAsync');
            return rejectWithValue('Failed to delete movie');
        }
    }
);

export const addMovieToDatabaseAsync = createAsyncThunk(
    'movies/addMovieToDatabase',
    async ({ movie, userId }: { movie: Movie; userId: string }, { rejectWithValue }) => {
        try {
            const addedMovie = await movieService.createMovie(movie, userId);
            return addedMovie;
        } catch (error) {
            logError(error, 'addMovieToDatabaseAsync');
            return rejectWithValue('Failed to add movie to database');
        }
    }
); const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        setSearchResults: (state, action: PayloadAction<Movie[]>) => {
            state.searchResults = action.payload;
            state.isSearching = action.payload.length > 0;
        },
        clearSearch: (state) => {
            state.searchResults = [];
            state.isSearching = false;
        },
        updateMovie: (state, action: PayloadAction<Movie>) => {
            const index = state.movies.findIndex(movie => movie.id === action.payload.id);
            if (index !== -1) {
                state.movies[index] = action.payload;
            }
        },
        addMovie: (state, action: PayloadAction<Movie>) => {
            state.movies.push(action.payload);
        },
        removeMovieFromSearch: (state, action: PayloadAction<{ title: string; year: string }>) => {
            state.searchResults = state.searchResults.filter(
                movie => !(movie.title === action.payload.title && movie.year === action.payload.year)
            );
        },
        // New action to update favorite status locally
        setFavoriteLocal: (state, action: PayloadAction<{ movieId: number; isFavorite: boolean }>) => {
            const { movieId, isFavorite } = action.payload;
            state.favorites[movieId] = isFavorite;
            saveFavoritesToStorage(state.favorites);

            // Update movie in movies array
            const movie = state.movies.find(m => m.id === movieId);
            if (movie) {
                movie.is_favorite = isFavorite;
            }

            // Update movie in search results
            const searchMovie = state.searchResults.find(m => m.id === movieId);
            if (searchMovie) {
                searchMovie.is_favorite = isFavorite;
            }
        },
        // Action to clear all favorites (e.g., on logout)
        clearFavorites: (state) => {
            state.favorites = {};
            saveFavoritesToStorage({});
            // Update all movies to remove favorite status
            state.movies.forEach(movie => {
                movie.is_favorite = false;
            });
            state.searchResults.forEach(movie => {
                movie.is_favorite = false;
            });
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch movies
            .addCase(fetchMoviesAsync.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMoviesAsync.fulfilled, (state, action) => {
                state.isLoading = false;
                state.movies = action.payload;
            })
            .addCase(fetchMoviesAsync.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch movies';
            })
            // Sync favorites
            .addCase(syncFavoritesAsync.fulfilled, (state, action) => {
                // Update favorites based on sync results
                action.payload.forEach((result: any) => {
                    if (result && result.movieId) {
                        // Use server status as the source of truth
                        state.favorites[result.movieId] = result.serverStatus;

                        // Update movie objects
                        const movie = state.movies.find(m => m.id === result.movieId);
                        if (movie) {
                            movie.is_favorite = result.serverStatus;
                        }

                        const searchMovie = state.searchResults.find(m => m.id === result.movieId);
                        if (searchMovie) {
                            searchMovie.is_favorite = result.serverStatus;
                        }
                    }
                });

                // Save updated favorites to localStorage
                saveFavoritesToStorage(state.favorites);
            })
            // Toggle favorite
            .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
                const { movieId, isFavorite } = action.payload;

                // Update local favorites cache
                state.favorites[movieId] = isFavorite;
                saveFavoritesToStorage(state.favorites);

                // Update movie objects
                const movie = state.movies.find(m => m.id === movieId);
                if (movie) {
                    movie.is_favorite = isFavorite;
                }
                const searchMovie = state.searchResults.find(m => m.id === movieId);
                if (searchMovie) {
                    searchMovie.is_favorite = isFavorite;
                }
            })
            // Delete movie
            .addCase(deleteMovieAsync.fulfilled, (state, action) => {
                const movieId = action.payload;
                state.movies = state.movies.filter(movie => movie.id !== movieId);
                // Remove from favorites cache
                delete state.favorites[movieId];
                saveFavoritesToStorage(state.favorites);
            })
            // Add movie to database
            .addCase(addMovieToDatabaseAsync.fulfilled, (state, action) => {
                state.movies.push(action.payload);
                // Remove from search results
                state.searchResults = state.searchResults.filter(
                    movie => !(movie.title === action.payload.title && movie.year === action.payload.year)
                );
            });
    },
});

export const {
    setSearchResults,
    clearSearch,
    updateMovie,
    addMovie,
    removeMovieFromSearch,
    setFavoriteLocal,
    clearFavorites,
} = moviesSlice.actions;

export default moviesSlice.reducer;
