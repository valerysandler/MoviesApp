import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useUser } from './useUser';
import { fetchOrCreateUser, clearSuccessMessage } from '../store/userSlice';
import type { AppDispatch } from '../store/store';

export const useAuthAction = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user, error, successMessage } = useUser();
    const [showModal, setShowModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const executeWithAuth = useCallback(async (action: () => void) => {
        if (isAuthenticated && user) {
            // User is authenticated, execute the action immediately
            action();
        } else {
            // Authentication is required, save the action and show the modal
            setPendingAction(() => action);
            setShowModal(true);
        }
    }, [isAuthenticated, user]);

    const handleUserSubmit = async (username: string) => {
        try {
            await dispatch(fetchOrCreateUser(username)).unwrap();
            // Wait for 2 seconds, then close the modal and execute the action
            setTimeout(() => {
                setShowModal(false);
                // Execute the delayed action after successful authentication
                if (pendingAction) {
                    pendingAction();
                    setPendingAction(null);
                }
            }, 2000);

        } catch (error) {
            console.error('Failed to authenticate user:', error);
            // Modal remains open on error
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setPendingAction(null);
        dispatch(clearSuccessMessage());
    };

    return {
        executeWithAuth,
        showModal,
        handleUserSubmit,
        handleModalClose,
        isAuthenticated,
        user,
        error,
        successMessage
    };
};
