/**
 * HTTP client utilities with proper error handling
 */

import { API_CONFIG } from '../config/constants';
import { ApiError, createApiError, logError } from './errors';

export interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
}

class HttpClient {
    private baseUrl: string;
    private defaultTimeout: number;

    constructor(baseUrl: string = API_CONFIG.BASE_URL, timeout: number = API_CONFIG.TIMEOUT) {
        this.baseUrl = baseUrl;
        this.defaultTimeout = timeout;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw createApiError(response, errorText);
        }

        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            return response.json();
        }

        return response.text() as unknown as T;
    }

    private createAbortController(timeout: number): AbortController {
        const controller = new AbortController();

        setTimeout(() => {
            controller.abort();
        }, timeout);

        return controller;
    }

    async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        const {
            method = 'GET',
            headers = {},
            body,
            timeout = this.defaultTimeout
        } = config;

        const url = `${this.baseUrl}${endpoint}`;
        const controller = this.createAbortController(timeout);

        const requestHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            ...headers
        };

        // Remove Content-Type for FormData
        if (body instanceof FormData) {
            delete requestHeaders['Content-Type'];
        }

        try {
            const response = await fetch(url, {
                method,
                headers: requestHeaders,
                body: body instanceof FormData ? body : JSON.stringify(body),
                signal: controller.signal
            });

            return this.handleResponse<T>(response);
        } catch (error) {
            logError(error, `HTTP ${method} ${endpoint}`);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new ApiError('Request timeout', 408);
            }

            throw error;
        }
    }

    get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    post<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'POST', body });
    }

    put<T>(endpoint: string, body?: any, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'PUT', body });
    }

    delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }
}

// Export singleton instance
export const httpClient = new HttpClient();
