import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setSearchResults, clearSearch } from '../store/moviesSlice';
import { searchMovies } from '../services/MovieService';
import { useNotification } from './useNotification';

/**
 * Custom hook for movie search functionality
 */
export const useMovieSearch = () => {
    const dispatch = useAppDispatch();
    const { showSuccess, showError, showInfo } = useNotification();

    const handleSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            dispatch(clearSearch());
            return;
        }

        try {
            const data = await searchMovies(query);
            dispatch(setSearchResults(data));

            if (data.length === 0) {
                showInfo(`No movies found for "${query}"`);
            } else {
                showSuccess(`Found ${data.length} movie${data.length > 1 ? 's' : ''} for "${query}"`);
            }
        } catch (error) {
            console.error('Search error:', error);
            showError(`Failed to search for "${query}". Please try again.`);
            throw error; // Re-throw for caller to handle UI feedback
        }
    }, [dispatch, showSuccess, showError, showInfo]);

    const handleClearSearch = useCallback(() => {
        dispatch(clearSearch());
        showInfo('Search cleared');
    }, [dispatch, showInfo]);

    return {
        handleSearch,
        handleClearSearch
    };
};
