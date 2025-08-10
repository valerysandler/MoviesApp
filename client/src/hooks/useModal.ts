/**
 * Custom hook for managing modal state
 */

import { useState, useCallback } from 'react';

export interface UseModalReturn {
    isOpen: boolean;
    data: any;
    openModal: (data?: any) => void;
    closeModal: () => void;
    toggleModal: () => void;
}

export const useModal = (initialState: boolean = false): UseModalReturn => {
    const [isOpen, setIsOpen] = useState(initialState);
    const [data, setData] = useState<any>(null);

    const openModal = useCallback((modalData?: any) => {
        setData(modalData || null);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setData(null);
    }, []);

    const toggleModal = useCallback(() => {
        setIsOpen(prev => !prev);
        if (isOpen) {
            setData(null);
        }
    }, [isOpen]);

    return {
        isOpen,
        data,
        openModal,
        closeModal,
        toggleModal,
    };
};
