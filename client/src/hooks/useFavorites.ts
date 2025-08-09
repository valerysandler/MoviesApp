import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setFavoriteLocal as setFavoriteLocalAction, clearFavorites, syncFavoritesAsync } from '../store/moviesSlice';
import { useUser } from './useUser';

export const useFavorites = () => {
    const dispatch = useAppDispatch();
    const { user } = useUser();
    const { favorites } = useAppSelector(state => state.movies);

    // Set favorite status locally (immediate UI update)
    const setFavoriteLocal = useCallback((movieId: number, isFavorite: boolean) => {
        dispatch(setFavoriteLocalAction({ movieId, isFavorite }));
    }, [dispatch]);

    // Sync favorites with server
    const syncWithServer = useCallback(async () => {
        if (user?.id) {
            await dispatch(syncFavoritesAsync(user.id.toString()));
        }
    }, [dispatch, user]);

    // Clear all favorites (e.g., on logout)
    const clearAllFavorites = useCallback(() => {
        dispatch(clearFavorites());
    }, [dispatch]);

    // Check if movie is favorite
    const isFavorite = useCallback((movieId: number): boolean => {
        return favorites[movieId] || false;
    }, [favorites]);

    // Get all favorite movie IDs
    const getFavoriteIds = useCallback((): number[] => {
        return Object.keys(favorites)
            .filter(id => favorites[parseInt(id)])
            .map(id => parseInt(id));
    }, [favorites]);

    return {
        favorites,
        setFavoriteLocal,
        syncWithServer,
        clearAllFavorites,
        isFavorite,
        getFavoriteIds,
    };
};
