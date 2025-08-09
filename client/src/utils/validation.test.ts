import { describe, it, expect } from 'vitest';
import {
    validateRequired,
    validateLength,
    validateYear,
    validateMovie,
    sanitizeMovieData
} from './validation';
import { ValidationError } from './errors';
import type { MovieFormData } from '../types';

describe('Validation Utils', () => {
    describe('validateRequired', () => {
        it('should return true for non-empty strings', () => {
            expect(validateRequired('hello')).toBe(true);
            expect(validateRequired('a')).toBe(true);
            expect(validateRequired('  test  ')).toBe(true); // should trim
        });

        it('should return false for empty or null values', () => {
            expect(validateRequired('')).toBe(false);
            expect(validateRequired('   ')).toBe(false); // only whitespace
            expect(validateRequired(null)).toBe(false);
            expect(validateRequired(undefined)).toBe(false);
        });

        it('should handle non-string values', () => {
            expect(validateRequired(123)).toBe(true);
            expect(validateRequired(0)).toBe(false);
            expect(validateRequired(false)).toBe(true);
        });
    });

    describe('validateLength', () => {
        it('should validate minimum length', () => {
            const validator = validateLength(3);
            expect(validator('abc')).toBe(true);
            expect(validator('abcd')).toBe(true);
            expect(validator('ab')).toBe(false);
            expect(validator('')).toBe(false);
        });

        it('should validate maximum length', () => {
            const validator = validateLength(2, 5);
            expect(validator('abc')).toBe(true);
            expect(validator('abcde')).toBe(true);
            expect(validator('a')).toBe(false);
            expect(validator('abcdef')).toBe(false);
        });

        it('should trim whitespace before validation', () => {
            const validator = validateLength(3, 5);
            expect(validator('  abc  ')).toBe(true);
            expect(validator('  ab  ')).toBe(false);
        });
    });

    describe('validateYear', () => {
        const currentYear = new Date().getFullYear();

        it('should accept valid years', () => {
            expect(validateYear('2023')).toBe(true);
            expect(validateYear('1950')).toBe(true);
            expect(validateYear('1900')).toBe(true);
            expect(validateYear(currentYear.toString())).toBe(true);
            expect(validateYear((currentYear + 1).toString())).toBe(true);
        });

        it('should reject invalid years', () => {
            expect(validateYear('1899')).toBe(false);
            expect(validateYear((currentYear + 2).toString())).toBe(false);
            expect(validateYear('abc')).toBe(false);
            expect(validateYear('-100')).toBe(false);
        });

        it('should accept empty year (optional field)', () => {
            expect(validateYear('')).toBe(true);
            expect(validateYear(undefined as any)).toBe(true);
        });
    });

    describe('validateMovie', () => {
        const validMovieData: MovieFormData = {
            title: 'The Matrix',
            year: '1999',
            genre: 'Sci-Fi',
            runtime: '136 min',
            director: 'The Wachowskis',
            is_favorite: false
        };

        it('should pass validation for valid movie data', () => {
            expect(() => validateMovie(validMovieData)).not.toThrow();
        });

        it('should throw ValidationError for missing title', () => {
            const invalidData = { ...validMovieData, title: '' };
            expect(() => validateMovie(invalidData)).toThrow(ValidationError);
            expect(() => validateMovie(invalidData)).toThrow('Title is required');
        });

        it('should throw ValidationError for title too long', () => {
            const longTitle = 'a'.repeat(201);
            const invalidData = { ...validMovieData, title: longTitle };
            expect(() => validateMovie(invalidData)).toThrow(ValidationError);
            expect(() => validateMovie(invalidData)).toThrow('must be between 1 and 200 characters');
        });

        it('should throw ValidationError for invalid year', () => {
            const invalidData = { ...validMovieData, year: '1800' };
            expect(() => validateMovie(invalidData)).toThrow(ValidationError);
            expect(() => validateMovie(invalidData)).toThrow('Year must be between 1900');
        });

        it('should allow optional fields to be empty', () => {
            const minimalData: MovieFormData = {
                title: 'Test Movie',
                is_favorite: false
            };
            expect(() => validateMovie(minimalData)).not.toThrow();
        });
    });

    describe('sanitizeMovieData', () => {
        it('should trim whitespace from all string fields', () => {
            const dirtyData: MovieFormData = {
                title: '  The Matrix  ',
                year: '  1999  ',
                genre: '  Sci-Fi  ',
                runtime: '  136 min  ',
                director: '  The Wachowskis  ',
                is_favorite: false
            };

            const cleaned = sanitizeMovieData(dirtyData);

            expect(cleaned.title).toBe('The Matrix');
            expect(cleaned.year).toBe('1999');
            expect(cleaned.genre).toBe('Sci-Fi');
            expect(cleaned.runtime).toBe('136 min');
            expect(cleaned.director).toBe('The Wachowskis');
        });

        it('should handle empty and undefined values', () => {
            const sparseData: MovieFormData = {
                title: 'Test',
                year: '',
                genre: undefined,
                is_favorite: false
            };

            const cleaned = sanitizeMovieData(sparseData);

            expect(cleaned.title).toBe('Test');
            expect(cleaned.year).toBe(undefined);
            expect(cleaned.genre).toBe(undefined);
        });

        it('should preserve poster fields', () => {
            const dataWithPosters: MovieFormData = {
                title: 'Test',
                poster: 'http://example.com/poster.jpg',
                poster_local: '/local/poster.jpg',
                is_favorite: false
            };

            const cleaned = sanitizeMovieData(dataWithPosters);

            expect(cleaned.poster).toBe('http://example.com/poster.jpg');
            expect(cleaned.poster_local).toBe('/local/poster.jpg');
        });
    });
});
