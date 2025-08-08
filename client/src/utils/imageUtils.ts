/**
 * Image utilities for movie posters
 */

import type { Movie } from "../types";
import { API_CONFIG } from '../config/constants';

export const getPosterUrl = (movie: Movie): string => {
    if (movie.poster_local) {
        // If already absolute URL, return as is
        if (movie.poster_local.startsWith('http')) {
            return movie.poster_local;
        }
        // Add base API URL for local files
        return `${API_CONFIG.BASE_URL}${movie.poster_local}`;
    }

    // Return external URL from API or fallback
    return movie.poster || '/placeholder-poster.jpg';
};

export const validateImageFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPEG, PNG, or WebP images.');
    }

    if (file.size > maxSize) {
        throw new Error('File size too large. Please upload images smaller than 5MB.');
    }

    return true;
};

export const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                reject(new Error('Failed to create image preview'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read image file'));
        };

        reader.readAsDataURL(file);
    });
};
