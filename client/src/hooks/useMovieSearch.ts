import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setSearchResults, clearSearch } from '../store/moviesSlice';
import { searchMovies } from '../services/MovieService';

/**
 * Custom hook for movie search functionality
 */
export const useMovieSearch = () => {
  const dispatch = useAppDispatch();

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      dispatch(clearSearch());
      return;
    }

    try {
      const data = await searchMovies(query);
      dispatch(setSearchResults(data));
    } catch (error) {
      console.error('Search error:', error);
      throw error; // Re-throw for caller to handle UI feedback
    }
  }, [dispatch]);

  const handleClearSearch = useCallback(() => {
    dispatch(clearSearch());
  }, [dispatch]);

  return {
    handleSearch,
    handleClearSearch
  };
};
