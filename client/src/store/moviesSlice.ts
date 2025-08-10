import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Movie } from '../types';
import { fetchMovies as fetchMoviesAPI, toggleFavorite as toggleFavoriteAPI, addMovieToDatabase as addMovieAPI, deleteMovie as deleteMovieAPI } from '../services';

export interface MoviesState {
    movies: Movie[];
    searchResults: Movie[];
    isSearching: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: MoviesState = {
    movies: [],
    searchResults: [],
    isSearching: false,
    loading: false,
    error: null,
};

export const fetchMoviesAsync = createAsyncThunk(
    'movies/fetchMovies',
    async () => await fetchMoviesAPI()
);

export const addMovieToDatabaseAsync = createAsyncThunk(
    'movies/addMovieToDatabase',
    async ({ movie, userId }: { movie: Movie; userId: string }) =>
        await addMovieAPI(movie, userId)
);

export const deleteMovieAsync = createAsyncThunk(
    'movies/deleteMovie',
    async (movieId: number) => {
        await deleteMovieAPI(movieId);
        return movieId;
    }
);

export const toggleFavoriteAsync = createAsyncThunk(
    'movies/toggleFavorite',
    async ({ movieId, userId }: { movieId: number; userId: string }) => {
        const isFavorite = await toggleFavoriteAPI(movieId, userId);
        return { movieId, isFavorite };
    }
);

const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        setSearchResults: (state, action: PayloadAction<Movie[]>) => {
            state.searchResults = action.payload;
            state.isSearching = true;
        },
        clearSearch: (state) => {
            state.searchResults = [];
            state.isSearching = false;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMoviesAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMoviesAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.movies = action.payload;
            })
            .addCase(fetchMoviesAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to load movies';
            })
            .addCase(addMovieToDatabaseAsync.fulfilled, (state, action) => {
                state.movies.push(action.payload);
            })
            .addCase(addMovieToDatabaseAsync.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to add movie';
            })
            .addCase(deleteMovieAsync.fulfilled, (state, action) => {
                state.movies = state.movies.filter(movie => movie.id !== action.payload);
            })
            .addCase(deleteMovieAsync.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to delete movie';
            })
            .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
                const { movieId, isFavorite } = action.payload;
                const movie = state.movies.find(m => m.id === movieId);
                if (movie) movie.is_favorite = isFavorite;

                // Also update the search results if they exist
                const searchMovie = state.searchResults.find(m => m.id === movieId);
                if (searchMovie) searchMovie.is_favorite = isFavorite;
            })
            .addCase(toggleFavoriteAsync.rejected, (state, action) => {
                state.error = action.error.message || 'Failed to toggle favorite';
            });
    },
});

export const { setSearchResults, clearSearch, clearError } = moviesSlice.actions;

export const fetchMovies = fetchMoviesAsync;
export const toggleFavorite = toggleFavoriteAsync;
export const addMovieToDatabase = addMovieToDatabaseAsync;
export const deleteMovie = deleteMovieAsync;

export default moviesSlice.reducer;
