import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';

export const useNotification = () => {
    const defaultOptions: ToastOptions = {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    const showSuccess = (message: string, options?: ToastOptions) => {
        toast.success(message, { ...defaultOptions, ...options });
    };

    const showError = (message: string, options?: ToastOptions) => {
        toast.error(message, { ...defaultOptions, ...options });
    };

    const showInfo = (message: string, options?: ToastOptions) => {
        toast.info(message, { ...defaultOptions, ...options });
    };

    const showWarning = (message: string, options?: ToastOptions) => {
        toast.warning(message, { ...defaultOptions, ...options });
    };

    const showDefault = (message: string, options?: ToastOptions) => {
        toast(message, { ...defaultOptions, ...options });
    };

    return {
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showDefault,
    };
};
