/**
 * Core domain types and interfaces
 */

export interface Movie {
    id: number;
    title: string;
    year?: string;
    genre?: string;
    runtime?: string;
    director?: string;
    poster?: string;
    poster_local?: string;
    user_id: number;
    is_favorite: boolean;
}

export interface User {
    id: number;
    username: string;
    message?: string;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// Form types
export type MovieFormData = Omit<Movie, 'id' | 'user_id'>;
export type MovieUpdateData = Partial<Movie> & { id: number };

// API types
export interface CreateMovieRequest extends MovieFormData {
    user_id: string;
}
export type UpdateMovieRequest = MovieUpdateData;
export type ToggleFavoriteRequest = { movieId: number; userId: string };

// UI State types
export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

export interface ModalState {
    isOpen: boolean;
    data?: any;
}

// Event types
export type EventHandler<T = void> = (data: T) => void;
export type AsyncEventHandler<T = void> = (data: T) => Promise<void>;
