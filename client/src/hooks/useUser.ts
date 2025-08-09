import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import type { RootState, AppDispatch } from '../store/store';
import { loadUserFromStorage } from '../store/userSlice';

export const useUser = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, isAuthenticated, loading, error, successMessage } = useSelector((state: RootState) => state.user);

    // Load user from localStorage on initial render if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    dispatch(loadUserFromStorage(userData));
                } catch (error) {
                    console.error('Failed to load user from localStorage:', error);
                    localStorage.removeItem('user');
                }
            }
        }
    }, [dispatch, isAuthenticated]);

    return {
        user,
        isAuthenticated,
        loading,
        error,
        successMessage
    };
};
