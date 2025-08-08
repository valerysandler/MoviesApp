import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Movie } from '../models/MovieModel';
import { fetchMovies, toggleFavorite, deleteMovie, addMovieToDatabase } from '../services/MovieService';

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
    async () => {
        const response = await fetchMovies();
        return response;
    }
);

export const toggleFavoriteAsync = createAsyncThunk(
    'movies/toggleFavorite',
    async ({ movieId, userId }: { movieId: number; userId: string }) => {
        const newFavoriteStatus = await toggleFavorite(movieId, userId);
        return { movieId, isFavorite: newFavoriteStatus };
    }
);

export const deleteMovieAsync = createAsyncThunk(
    'movies/deleteMovie',
    async (movieId: number) => {
        await deleteMovie(movieId);
        return movieId;
    }
);

export const addMovieToDatabaseAsync = createAsyncThunk(
    'movies/addMovieToDatabase',
    async ({ movie, userId }: { movie: Movie; userId: string }) => {
        const addedMovie = await addMovieToDatabase(movie, userId);
        return addedMovie;
    }
);

const moviesSlice = createSlice({
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
