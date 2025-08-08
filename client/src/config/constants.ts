/**
 * Application configuration constants
 */

export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    ENDPOINTS: {
        MOVIES: '/api/movies',
        FAVORITES: '/api/movies/favorites',
        SEARCH: '/api/movies/search',
    },
    TIMEOUT: 10000, // 10 seconds
} as const;

export const UI_CONFIG = {
    ANIMATIONS: {
        DURATION: 300,
        EASING: 'ease-in-out',
    },
    BREAKPOINTS: {
        MOBILE: 768,
        TABLET: 1024,
        DESKTOP: 1200,
    },
} as const;

export const APP_CONFIG = {
    TITLE: '🎬 Movies',
    DESCRIPTION: 'Discover, manage and organize your favorite movies',
    VERSION: '1.0.0',
} as const;
