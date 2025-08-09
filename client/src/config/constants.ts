
// Force production API URL if environment variables are not set
const getApiUrl = () => {
    const viteUrl = import.meta.env.VITE_API_URL;
    const reactUrl = import.meta.env.REACT_APP_API_URL;
    const defaultUrl = 'http://localhost:5000';

    // If we're in production mode, force the production URL
    if (import.meta.env.MODE === 'production') {
        return viteUrl || reactUrl || 'https://moviesapp-3.onrender.com';
    }

    return viteUrl || reactUrl || defaultUrl;
};

export const API_CONFIG = {
    BASE_URL: getApiUrl(),
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
