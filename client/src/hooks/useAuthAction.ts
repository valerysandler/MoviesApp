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
            // Пользователь уже аутентифицирован, выполняем действие
            action();
        } else {
            // Нужна аутентификация, сохраняем действие и показываем модаль
            setPendingAction(() => action);
            setShowModal(true);
        }
    }, [isAuthenticated, user]);

    const handleUserSubmit = async (username: string) => {
        try {
            await dispatch(fetchOrCreateUser(username)).unwrap();

            // Ждем 2 секунды, затем закрываем модалку и выполняем действие
            setTimeout(() => {
                setShowModal(false);

                // Выполняем отложенное действие после успешной аутентификации
                if (pendingAction) {
                    pendingAction();
                    setPendingAction(null);
                }
            }, 2000);

        } catch (error) {
            console.error('Failed to authenticate user:', error);
            // Модаль остается открытым при ошибке
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
