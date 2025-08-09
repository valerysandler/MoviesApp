import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, UserState } from './types';
import axios from 'axios';
import { buildApiUrl } from '../utils/api';

// Async thunk для создания/получения пользователя
export const fetchOrCreateUser = createAsyncThunk(
    'user/fetchOrCreate',
    async (username: string) => {
        const response = await axios.post(buildApiUrl('/api/users'), {
            username: username.trim()
        });
        if (response.status !== 200 && response.status !== 201) {
            throw new Error('Failed to create/fetch user');
        }
        return response.data;
    }
);

const initialState: UserState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    successMessage: null
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
            state.successMessage = null;
            localStorage.removeItem('user');
            // Clear favorites cache when user logs out
            localStorage.removeItem('movieFavorites');
        },
        loadUserFromStorage: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrCreateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(fetchOrCreateUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
                state.successMessage = action.payload.message || null;
                // Сохраняем в localStorage (без message)
                const { message, ...userToSave } = action.payload;
                localStorage.setItem('user', JSON.stringify(userToSave));
            })
            .addCase(fetchOrCreateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to authenticate user';
                state.successMessage = null;
            });
    }
});

export const { logout, loadUserFromStorage, clearError, clearSuccessMessage } = userSlice.actions;
export default userSlice.reducer;