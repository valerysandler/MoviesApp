export const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }
    return 'Something went wrong';
};

export const logError = (error: unknown, context?: string): void => {
    const message = handleApiError(error);
    console.error(context ? `[${context}] ${message}` : message);
};

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}
