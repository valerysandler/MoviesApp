import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { fetchMoviesAsync, addMovieToDatabaseAsync } from '../store/moviesSlice';
import { addMovieWithImage } from '../services/MovieService';
import { useUser } from './useUser';
import type { Movie } from '../types';

/**
 * Custom hook for movie operations (add, update, delete)
 */
export const useMovieOperations = () => {
  const dispatch = useAppDispatch();
  const { user } = useUser();

  const refreshMovies = useCallback(() => {
    dispatch(fetchMoviesAsync());
  }, [dispatch]);

  const addMovieWithFile = useCallback(async (newMovie: Movie, posterFile?: File) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    if (posterFile) {
      await addMovieWithImage(newMovie, posterFile, user.id.toString());
    } else {
      console.log('Adding movie without file:', newMovie);
      // TODO: Implement adding movie without file
    }
    
    // Refresh movies list
    await dispatch(fetchMoviesAsync());
  }, [user, dispatch]);

  const addMovieToDatabase = useCallback(async (movie: Movie) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    await dispatch(addMovieToDatabaseAsync({ 
      movie, 
      userId: user.id.toString() 
    })).unwrap();
  }, [user, dispatch]);

  return {
    refreshMovies,
    addMovieWithFile,
    addMovieToDatabase
  };
};
