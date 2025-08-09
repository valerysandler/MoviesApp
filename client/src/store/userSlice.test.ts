import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import userReducer, {
    logout,
    loadUserFromStorage,
    clearError,
    clearSuccessMessage,
    fetchOrCreateUser
} from './userSlice';
import type { UserState } from './types';

// Helper function to create test store
const createTestStore = (initialState?: Partial<UserState>) => {
    return configureStore({
        reducer: {
            user: userReducer
        },
        preloadedState: {
            user: {
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
                successMessage: null,
                ...initialState
            }
        }
    });
};

describe('userSlice', () => {
    let store: ReturnType<typeof createTestStore>;

    beforeEach(() => {
        store = createTestStore();
        // Clear localStorage before each test
        localStorage.clear();
    });

    describe('initial state', () => {
        it('should have correct initial state', () => {
            const state = store.getState().user;
            expect(state).toEqual({
                user: null,
                isAuthenticated: false,
                loading: false,
                error: null,
                successMessage: null
            });
        });
    });

    describe('logout action', () => {
        it('should reset user state and clear localStorage', () => {
            // Arrange: create store with authenticated user
            const authenticatedStore = createTestStore({
                user: { id: 1, username: 'testuser' },
                isAuthenticated: true,
                successMessage: 'Welcome!'
            });

            // Set something in localStorage
            localStorage.setItem('user', JSON.stringify({ id: 1, username: 'testuser' }));
            localStorage.setItem('movieFavorites', JSON.stringify({ 1: true }));

            // Act
            authenticatedStore.dispatch(logout());

            // Assert
            const state = authenticatedStore.getState().user;
            expect(state.user).toBe(null);
            expect(state.isAuthenticated).toBe(false);
            expect(state.error).toBe(null);
            expect(state.successMessage).toBe(null);
            expect(localStorage.getItem('user')).toBe(null);
            expect(localStorage.getItem('movieFavorites')).toBe(null);
        });
    });

    describe('loadUserFromStorage action', () => {
        it('should load user and set authenticated state', () => {
            // Arrange
            const userData = { id: 1, username: 'testuser' };

            // Act
            store.dispatch(loadUserFromStorage(userData));

            // Assert
            const state = store.getState().user;
            expect(state.user).toEqual(userData);
            expect(state.isAuthenticated).toBe(true);
        });
    });

    describe('clearError action', () => {
        it('should clear error state', () => {
            // Arrange: store with error
            const errorStore = createTestStore({
                error: 'Something went wrong'
            });

            // Act
            errorStore.dispatch(clearError());

            // Assert
            const state = errorStore.getState().user;
            expect(state.error).toBe(null);
        });
    });

    describe('clearSuccessMessage action', () => {
        it('should clear success message', () => {
            // Arrange: store with success message
            const successStore = createTestStore({
                successMessage: 'Operation successful'
            });

            // Act
            successStore.dispatch(clearSuccessMessage());

            // Assert
            const state = successStore.getState().user;
            expect(state.successMessage).toBe(null);
        });
    });

    describe('fetchOrCreateUser async thunk', () => {
        it('should handle pending state', () => {
            // Act: dispatch pending action
            store.dispatch(fetchOrCreateUser.pending('requestId', 'testuser'));

            // Assert
            const state = store.getState().user;
            expect(state.loading).toBe(true);
            expect(state.error).toBe(null);
            expect(state.successMessage).toBe(null);
        });

        it('should handle fulfilled state', () => {
            // Arrange
            const userData = { id: 1, username: 'testuser', message: 'Welcome back!' };

            // Act
            store.dispatch(fetchOrCreateUser.fulfilled(userData, 'requestId', 'testuser'));

            // Assert
            const state = store.getState().user;
            expect(state.loading).toBe(false);
            expect(state.user).toEqual(userData);
            expect(state.isAuthenticated).toBe(true);
            expect(state.error).toBe(null);
            expect(state.successMessage).toBe('Welcome back!');

            // Check localStorage (without message)
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            expect(savedUser).toEqual({ id: 1, username: 'testuser' });
            expect(savedUser.message).toBeUndefined();
        });

        it('should handle fulfilled state without message', () => {
            // Arrange
            const userData = { id: 1, username: 'testuser' };

            // Act
            store.dispatch(fetchOrCreateUser.fulfilled(userData, 'requestId', 'testuser'));

            // Assert
            const state = store.getState().user;
            expect(state.successMessage).toBe(null);
        });

        it('should handle rejected state', () => {
            // Arrange
            const error = new Error('Network error');

            // Act
            store.dispatch(fetchOrCreateUser.rejected(error, 'requestId', 'testuser'));

            // Assert
            const state = store.getState().user;
            expect(state.loading).toBe(false);
            expect(state.error).toBe('Network error');
            expect(state.successMessage).toBe(null);
        });

        it('should handle rejected state with default error message', () => {
            // Arrange: error without message
            const error = new Error();
            error.message = '';

            // Act
            store.dispatch(fetchOrCreateUser.rejected(error, 'requestId', 'testuser'));

            // Assert
            const state = store.getState().user;
            expect(state.error).toBe('Failed to authenticate user');
        });
    });

    describe('edge cases', () => {
        it('should handle multiple actions in sequence', () => {
            // Arrange
            const userData = { id: 1, username: 'testuser' };

            // Act: simulate user flow
            store.dispatch(fetchOrCreateUser.pending('1', 'testuser'));
            expect(store.getState().user.loading).toBe(true);

            store.dispatch(fetchOrCreateUser.fulfilled(userData, '1', 'testuser'));
            expect(store.getState().user.isAuthenticated).toBe(true);

            store.dispatch(logout());
            expect(store.getState().user.user).toBe(null);
        });

        it('should preserve state not affected by actions', () => {
            // Arrange: set initial error
            const initialStore = createTestStore({
                error: 'Initial error',
                loading: true
            });

            // Act: clear only success message
            initialStore.dispatch(clearSuccessMessage());

            // Assert: other state should be preserved
            const state = initialStore.getState().user;
            expect(state.error).toBe('Initial error');
            expect(state.loading).toBe(true);
        });
    });
});
