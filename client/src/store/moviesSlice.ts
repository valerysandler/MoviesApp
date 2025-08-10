import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Movie } from '../types';
import { movieService } from '../services/movieService';

interface MoviesState {
    movies: Movie[];
    searchResults: Movie[];
    isLoading: boolean;
    error: string | null;
    isSearching: boolean;
}

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
        const movies = await movieService.getAllMovies();
        return movies;
    }
);

export const addMovieToDatabaseAsync = createAsyncThunk(
    'movies/addMovieToDatabase',
    async ({ movie, userId }: { movie: Movie; userId: string }) => {
        const addedMovie = await movieService.createMovie(movie, userId);
        return addedMovie;
    }
);

export const deleteMovieAsync = createAsyncThunk(
    'movies/deleteMovie',
    async (movieId: number) => {
        await movieService.deleteMovie(movieId);
        return movieId;
    }
);

export const toggleFavoriteAsync = createAsyncThunk(
    'movies/toggleFavorite',
    async ({ movieId, userId }: { movieId: number; userId: string }) => {
        const isFavorite = await movieService.toggleFavorite(movieId, userId);
        return { movieId, isFavorite };
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
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
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
            // Add movie
            .addCase(addMovieToDatabaseAsync.fulfilled, (state, action) => {
                state.movies.push(action.payload);
                // Remove from search results if it was there
                state.searchResults = state.searchResults.filter(
                    movie => movie.title !== action.payload.title || movie.year !== action.payload.year
                );
            })
            // Delete movie
            .addCase(deleteMovieAsync.fulfilled, (state, action) => {
                state.movies = state.movies.filter(movie => movie.id !== action.payload);
            })
            // Toggle favorite
            .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
                const { movieId, isFavorite } = action.payload;

                // Update in movies array
                const movie = state.movies.find(m => m.id === movieId);
                if (movie) {
                    movie.is_favorite = isFavorite;
                }

                // Update in search results
                const searchMovie = state.searchResults.find(m => m.id === movieId);
                if (searchMovie) {
                    searchMovie.is_favorite = isFavorite;
                }
            });
    },
});

export const {
    setSearchResults,
    clearSearch,
    setLoading,
    setError,
} = moviesSlice.actions;

export default moviesSlice.reducer;
