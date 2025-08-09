import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from './store';

// Middleware to persist favorites to localStorage
export const favoritesMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
    const result = next(action);

    // Save favorites to localStorage after any action that might affect them
    if (action.type && (action.type.includes('movies/') || action.type.includes('favorites'))) {
        const state = store.getState();
        const favorites = state.movies.favorites;

        try {
            localStorage.setItem('movieFavorites', JSON.stringify(favorites));
        } catch (error) {
            console.error('Failed to save favorites to localStorage:', error);
        }
    }

    return result;
};
