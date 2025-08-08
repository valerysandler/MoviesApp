import React from 'react';
import styles from './DeleteConfirmModal.module.scss';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    title: string;
    itemName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    loadingText?: string;
    confirmText?: string;
    cancelText?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    title,
    itemName,
    onConfirm,
    onCancel,
    isLoading = false,
    loadingText = 'Deleting...',
    confirmText = 'Delete',
    cancelText = 'Cancel'
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalBackdrop} onClick={onCancel}>
            <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>Are you sure you want to delete "{itemName}"?</p>
                <p>This action cannot be undone.</p>
                <div className={styles.deleteButtonGroup}>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={styles.confirmDeleteButton}
                    >
                        {isLoading ? loadingText : confirmText}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className={styles.cancelDeleteButton}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
