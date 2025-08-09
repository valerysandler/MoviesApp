import { useMemo, useState, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import type { Movie } from '../types';

/**
 * Custom hook for movie filtering and display logic
 */
export const useMovieFiltering = () => {
  const { movies, searchResults, isSearching } = useAppSelector(state => state.movies);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const toggleFavoritesFilter = useCallback(() => {
    setShowOnlyFavorites(prev => !prev);
  }, []);

  const currentMovies = useMemo(() => {
    return isSearching ? searchResults : movies;
  }, [isSearching, searchResults, movies]);

  const filteredMovies = useMemo(() => {
    if (!showOnlyFavorites) {
      return currentMovies;
    }
    return currentMovies.filter((movie: Movie) => movie.is_favorite);
  }, [currentMovies, showOnlyFavorites]);

  return {
    filteredMovies,
    showOnlyFavorites,
    toggleFavoritesFilter,
    isSearching,
    hasMovies: filteredMovies.length > 0
  };
};
