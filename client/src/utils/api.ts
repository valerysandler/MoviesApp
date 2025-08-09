import { API_CONFIG } from '../config/constants';

/**
 * Utility function to build API URLs
 */
export const buildApiUrl = (endpoint: string): string => {
    const baseUrl = API_CONFIG.BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Enhanced fetch with API base URL
 */
export const apiFetch = async (endpoint: string, options?: RequestInit): Promise<Response> => {
    const url = buildApiUrl(endpoint);
    console.log('API Request:', url);
    return fetch(url, options);
};
