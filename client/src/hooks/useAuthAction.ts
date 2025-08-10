import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUser } from './useUser';
import { useNotification } from './useNotification';
import { fetchOrCreateUser } from '../store/userSlice';
import type { AppDispatch } from '../store/store';

export const useAuthAction = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, user, error } = useUser();
    const { showSuccess, showError } = useNotification();
    const [showModal, setShowModal] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const executeWithAuth = (action: () => void) => {
        if (isAuthenticated && user) {
            action();
        } else {
            setPendingAction(() => action);
            setShowModal(true);
        }
    };

    const handleUserSubmit = async (username: string) => {
        try {
            const result = await dispatch(fetchOrCreateUser(username)).unwrap();
            showSuccess(`Welcome, ${result.username}! 🎉`);
            setShowModal(false);
            if (pendingAction) {
                pendingAction();
                setPendingAction(null);
            }
        } catch (error) {
            showError('Login failed. Please try again.');
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        setPendingAction(null);
    };

    return { executeWithAuth, showModal, handleUserSubmit, handleModalClose, user, error };
};
