import type { MoviesState } from './moviesSlice';

export interface User {
    id: number;
    username: string;
    message?: string;
}

export interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    successMessage: string | null;
}

export interface RootState {
    user: UserState;
    movies: MoviesState;
}
