import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useUser } from './useUser';
import userReducer, { loadUserFromStorage } from '../store/userSlice';
import type { UserState } from '../store/types';

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// Helper to create test store
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

// Wrapper component for testing hooks with Redux
const createWrapper = (store: ReturnType<typeof createTestStore>) => {
    return ({ children }: { children: React.ReactNode }) => (
        <Provider store= { store } > { children } </Provider>
  );
};

describe('useUser hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initial behavior', () => {
        it('should return initial state when not authenticated', () => {
            // Arrange
            const store = createTestStore();
            mockLocalStorage.getItem.mockReturnValue(null);

            // Act
            const { result } = renderHook(() => useUser(), {
                wrapper: createWrapper(store),
            });

            // Assert
            expect(result.current.user).toBe(null);
            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBe(null);
            expect(result.current.successMessage).toBe(null);
        });

        it('should return authenticated state when user is already authenticated', () => {
            // Arrange
            const userData = { id: 1, username: 'testuser' };
            const store = createTestStore({
                user: userData,
                isAuthenticated: true
            });

            // Act
            const { result } = renderHook(() => useUser(), {
                wrapper: createWrapper(store),
            });

            // Assert
            expect(result.current.user).toEqual(userData);
            expect(result.current.isAuthenticated).toBe(true);
        });
    });

    describe('localStorage restoration', () => {
        it('should load user from localStorage when not authenticated', async () => {
            // Arrange
            const userData = { id: 1, username: 'testuser' };
            const store = createTestStore();
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(userData));

            // Act
            renderHook(() => useUser(), {
                wrapper: createWrapper(store),
            });

            // Wait for useEffect to run
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Assert
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');

            // Check that loadUserFromStorage was dispatched
            const state = store.getState().user;
            expect(state.user).toEqual(userData);
            expect(state.isAuthenticated).toBe(true);
        });

        it('should not load from localStorage when already authenticated', () => {
            // Arrange
            const userData = { id: 1, username: 'testuser' };
            const store = createTestStore({
                user: userData,
                isAuthenticated: true
            });

            // Act
            renderHook(() => useUser(), {
                wrapper: createWrapper(store),
            });

            // Assert
            expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
        });

        it('should handle corrupted localStorage data gracefully', async () => {
            // Arrange
            const store = createTestStore();
            mockLocalStorage.getItem.mockReturnValue('invalid-json');
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // Act
            renderHook(() => useUser(), {
                wrapper: createWrapper(store),
            });

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to load user from localStorage:',
                expect.any(SyntaxError)
            );
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');

            // State should remain unauthenticated
            const state = store.getState().user;
            expect(state.isAuthenticated).toBe(false);

            consoleSpy.mockRestore();
        });

        it('should handle empty localStorage gracefully', () => {
            // Arrange
            const store = createTestStore();
            mockLocalStorage.getItem.mockReturnValue(null);

            // Act
            renderHook(() => useUser(), {
                wrapper: createWrapper(store),
            });

            // Assert
            expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
            const state = store.getState().user;
            expect(state.isAuthenticated).toBe(false);
        });
    });

    describe('state updates', () => {
        it('should reflect Redux state changes', () => {
            // Arrange
            const store = createTestStore();
            const { result } = renderHook(() => useUser(), {
                wrapper: createWrapper(store),
            });

            // Initial state
            expect(result.current.isAuthenticated).toBe(false);

            // Act: update Redux state
            act(() => {
                const userData = { id: 1, username: 'testuser' };
                store.dispatch(loadUserFromStorage(userData));
            });

            // Assert: hook should reflect new state
            expect(result.current.user).toEqual({ id: 1, username: 'testuser' });
            expect(result.current.isAuthenticated).toBe(true);
        });

        it('should handle loading and error states', () => {
            // Arrange
            const store = createTestStore({
                loading: true,
                error: 'Network error'
            });

            // Act
            const { result } = renderHook(() => useUser(), {
                wrapper: createWrapper(store),
            });

            // Assert
            expect(result.current.loading).toBe(true);
            expect(result.current.error).toBe('Network error');
        });
    });

    describe('useEffect dependencies', () => {
        it('should re-run effect when isAuthenticated changes', async () => {
            // Arrange
            const store = createTestStore();
            mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ id: 1, username: 'test' }));

            const { rerender } = renderHook(() => useUser(), {
                wrapper: createWrapper(store),
            });

            // Clear the mock to track subsequent calls
            mockLocalStorage.getItem.mockClear();

            // Act: change authentication status
            act(() => {
                store.dispatch(loadUserFromStorage({ id: 1, username: 'test' }));
            });

            rerender();

            // Assert: localStorage should not be called again when authenticated
            expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
        });
    });
});
