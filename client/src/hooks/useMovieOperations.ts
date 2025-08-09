import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { fetchMoviesAsync, addMovieToDatabaseAsync } from '../store/moviesSlice';
import { addMovieWithImage } from '../services/MovieService';
import { useUser } from './useUser';
import { useNotification } from './useNotification';
import type { Movie } from '../types';

/**
 * Custom hook for movie operations (add, update, delete)
 */
export const useMovieOperations = () => {
    const dispatch = useAppDispatch();
    const { user } = useUser();
    const { showSuccess, showError } = useNotification();

    const refreshMovies = useCallback(() => {
        dispatch(fetchMoviesAsync());
    }, [dispatch]);

    const addMovieWithFile = useCallback(async (newMovie: Movie, posterFile?: File) => {
        if (!user) {
            throw new Error('User must be authenticated');
        }

        try {
            if (posterFile) {
                await addMovieWithImage(newMovie, posterFile, user.id.toString());
                showSuccess(`🎬 "${newMovie.title}" has been added successfully!`);
            } else {
                console.log('Adding movie without file:', newMovie);
                showError('Please select a poster image');
                return;
            }

            // Refresh movies list
            await dispatch(fetchMoviesAsync());
        } catch (error) {
            showError(`Failed to add "${newMovie.title}". Please try again.`);
            throw error;
        }
    }, [user, dispatch, showSuccess, showError]);

    const addMovieToDatabase = useCallback(async (movie: Movie) => {
        if (!user) {
            throw new Error('User must be authenticated');
        }

        try {
            await dispatch(addMovieToDatabaseAsync({
                movie,
                userId: user.id.toString()
            })).unwrap();
            showSuccess(`🎬 "${movie.title}" has been added to your collection!`);
        } catch (error) {
            showError(`Failed to add "${movie.title}" to your collection.`);
            throw error;
        }
    }, [user, dispatch, showSuccess, showError]);

    return {
        refreshMovies,
        addMovieWithFile,
        addMovieToDatabase
    };
};
