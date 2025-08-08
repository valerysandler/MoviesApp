/**
 * Validation utilities
 */

import { ValidationError } from './errors';
import type { MovieFormData } from '../types';

export interface ValidationRule<T> {
    field: keyof T;
    message: string;
    validator: (value: any) => boolean;
}

export const validateRequired = (value: any): boolean => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value != null && value !== '';
};

export const validateLength = (min: number, max?: number) => (value: string): boolean => {
    if (!value) return false;
    const length = value.trim().length;
    return length >= min && (max ? length <= max : true);
};

export const validateYear = (value: string): boolean => {
    if (!value) return true; // Optional field
    const year = parseInt(value, 10);
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear + 1;
};

export const movieValidationRules: ValidationRule<MovieFormData>[] = [
    {
        field: 'title',
        message: 'Title is required and must be at least 1 character',
        validator: validateRequired
    },
    {
        field: 'title',
        message: 'Title must be between 1 and 200 characters',
        validator: validateLength(1, 200)
    },
    {
        field: 'year',
        message: 'Year must be between 1900 and current year',
        validator: validateYear
    },
    {
        field: 'genre',
        message: 'Genre must be less than 100 characters',
        validator: (value: string) => !value || validateLength(1, 100)(value)
    },
    {
        field: 'runtime',
        message: 'Runtime must be less than 50 characters',
        validator: (value: string) => !value || validateLength(1, 50)(value)
    },
    {
        field: 'director',
        message: 'Director name must be less than 100 characters',
        validator: (value: string) => !value || validateLength(1, 100)(value)
    }
];

export const validateMovie = (data: MovieFormData): void => {
    for (const rule of movieValidationRules) {
        const value = data[rule.field];

        if (!rule.validator(value)) {
            throw new ValidationError(rule.message, rule.field as string);
        }
    }
};

export const sanitizeMovieData = (data: MovieFormData): MovieFormData => {
    return {
        title: data.title?.trim() || '',
        year: data.year?.trim() || undefined,
        genre: data.genre?.trim() || undefined,
        runtime: data.runtime?.trim() || undefined,
        director: data.director?.trim() || undefined,
        poster: data.poster || undefined,
        poster_local: data.poster_local || undefined,
    };
};
