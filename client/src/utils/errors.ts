/**
 * Error handling utilities
 */

export class ApiError extends Error {
    public status?: number;
    public code?: string;

    constructor(
        message: string,
        status?: number,
        code?: string
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

export class ValidationError extends Error {
    public field?: string;
    constructor(message: string, field?: string) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
    }
}

export const handleApiError = (error: unknown): string => {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
};

export const createApiError = (response: Response, message?: string): ApiError => {
    return new ApiError(
        message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
    );
};

export const logError = (error: unknown, context?: string): void => {
    const errorMessage = handleApiError(error);
    const logContext = context ? `[${context}]` : '';
    console.error(`${logContext} Error:`, errorMessage);
    if (error instanceof Error) {
        console.error('Stack:', error.stack);
    }
};
