import { API_CONFIG } from '../config/constants';
import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

// Utility function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
    const baseUrl = API_CONFIG.BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${cleanEndpoint}`;
};

// Enhanced fetch with API base URL
export const apiFetch = async (endpoint: string, options?: AxiosRequestConfig): Promise<AxiosResponse> => {
    const url = buildApiUrl(endpoint);
    return axios(url, options);
};
