import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeEach(() => {
    console.error = vi.fn();
});

afterEach(() => {
    console.error = originalError;
    vi.clearAllMocks();
});

// Global test utilities
declare global {
    var testUtils: {
        localStorageMock: typeof localStorageMock;
    };
}

globalThis.testUtils = {
    localStorageMock,
};
