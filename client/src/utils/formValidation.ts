/**
 * Простые правила валидации для форм
 */

export const movieValidationRules = {
    title: {
        required: "Title is required",
        minLength: { value: 1, message: "Title cannot be empty" },
        maxLength: { value: 100, message: "Title must be less than 100 characters" }
    },

    year: {
        required: "Year is required",
        pattern: { value: /^\d{4}$/, message: "Year must be a 4-digit number" },
        validate: {
            validRange: (value?: string) => {
                if (!value) return true;
                const year = parseInt(value);
                const currentYear = new Date().getFullYear();
                return (year >= 1900 && year <= currentYear + 5) || `Year must be between 1900 and ${currentYear + 5}`;
            }
        }
    },

    genre: {
        required: "Genre is required",
        minLength: { value: 2, message: "Genre must be at least 2 characters" },
        maxLength: { value: 50, message: "Genre must be less than 50 characters" }
    },

    runtime: {
        required: "Runtime is required",
        pattern: { value: /^\d+\s*min?$/i, message: "Runtime must be in format '120 min' or '120'" }
    },

    director: {
        required: "Director is required",
        minLength: { value: 2, message: "Director name must be at least 2 characters" },
        maxLength: { value: 100, message: "Director name must be less than 100 characters" }
    }
};
