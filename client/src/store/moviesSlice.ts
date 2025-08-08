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
}

export type { MoviesState };

const initialState: MoviesState = {
    movies: [],
    searchResults: [],
    isLoading: false,
    error: null,
    isSearching: false,
};

// Async thunks
export const fetchMoviesAsync = createAsyncThunk(
    'movies/fetchMovies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await movieService.getAllMovies();
            return response;
        } catch (error) {
            logError(error, 'fetchMoviesAsync');
            return rejectWithValue('Failed to fetch movies');
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
            // Toggle favorite
            .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
                const { movieId, isFavorite } = action.payload;
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
                state.movies = state.movies.filter(movie => movie.id !== action.payload);
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
} = moviesSlice.actions;

export default moviesSlice.reducer;
