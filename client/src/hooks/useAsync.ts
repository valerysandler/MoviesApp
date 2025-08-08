/**
 * Custom hook for handling async operations with loading and error states
 */

import { useState, useCallback } from 'react';
import { handleApiError } from '../utils/errors';

export interface AsyncState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}

export interface UseAsyncReturn<T> {
    state: AsyncState<T>;
    execute: (asyncFunction: () => Promise<T>) => Promise<T | null>;
    reset: () => void;
}

export const useAsync = <T>(): UseAsyncReturn<T> => {
    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        isLoading: false,
        error: null,
    });

    const execute = useCallback(async (asyncFunction: () => Promise<T>): Promise<T | null> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const result = await asyncFunction();
            setState({ data: result, isLoading: false, error: null });
            return result;
        } catch (error) {
            const errorMessage = handleApiError(error);
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return null;
        }
    }, []);

    const reset = useCallback(() => {
        setState({ data: null, isLoading: false, error: null });
    }, []);

    return { state, execute, reset };
};
