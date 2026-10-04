import type { HttpMethod } from "../../shared/types/types";

export interface ApiRequestOptions<TBody = unknown> {
    method?: HttpMethod;
    headers?: HeadersInit;
    body?: TBody;
    signal?: AbortSignal;
    requiresAuth?: boolean;
    skipAuthRefresh?: boolean;
}

export interface ApiClientConfig {
    baseUrl?: string;
    refreshPath?: string;
    loginPath?: string;
}

export class ApiError extends Error {
    readonly status: number;
    readonly data: unknown;

    constructor(message: string, status: number, data?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

const buildUrl = (baseUrl: string, path: string) => {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (!baseUrl) {
        return normalizedPath;
    }

    return `${baseUrl.replace(/\/+$/, '')}${normalizedPath}`;
};

const readResponseBody = async (response: Response): Promise<unknown> => {
    if (response.status === 204) {
        return undefined;
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return response.json() as Promise<unknown>;
    }

    const text = await response.text();
    return text || undefined;
};

const createHeaders = (headers?: HeadersInit, body?: unknown) => {
    const requestHeaders = new Headers(headers);

    if (body !== undefined && !requestHeaders.has('Content-Type')) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    return requestHeaders;
};

export const createApiClient = (config: ApiClientConfig = {}) => {
    const baseUrl = config.baseUrl?.trim() ?? '';
    const refreshPath = config.refreshPath?.trim();
    const loginPath = config.loginPath?.trim();
    let refreshPromise: Promise<boolean> | null = null;

    const isExcludedFromRefresh = (path: string) => {
        return path === refreshPath || path === loginPath;
    };

    const refreshSession = async (): Promise<boolean> => {
        if (!refreshPath) {
            return false;
        }

        try {
            const response = await fetch(buildUrl(baseUrl, refreshPath), {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                },
            });

            return response.ok;
        } catch {
            return false;
        }
    };

    const refreshSessionOnce = (): Promise<boolean> => {
        if (!refreshPromise) {
            refreshPromise = refreshSession().finally(() => {
                refreshPromise = null;
            });
        }

        return refreshPromise;
    };

    const request = async <TResponse, TBody = unknown>(
        path: string,
        options: ApiRequestOptions<TBody> = {}
    ): Promise<TResponse> => {
        const {
            method = 'GET',
            headers,
            body,
            signal,
            requiresAuth = true,
            skipAuthRefresh = false,
        } = options;

        const response = await fetch(buildUrl(baseUrl, path), {
            method,
            credentials: 'include',
            headers: createHeaders(headers, body),
            body: body === undefined ? undefined : JSON.stringify(body),
            signal,
        });

        if (
            response.status === 401 &&
            requiresAuth &&
            !skipAuthRefresh &&
            !isExcludedFromRefresh(path)
        ) {
            const refreshed = await refreshSessionOnce();

            if (refreshed) {
                return request<TResponse, TBody>(path, {
                    ...options,
                    skipAuthRefresh: true,
                });
            }
        }

        const data = await readResponseBody(response);

        if (!response.ok) {
            throw new ApiError(
                `HTTP request failed with status ${response.status}`,
                response.status,
                data
            );
        }

        return data as TResponse;
    };

    return {
        request,

        get: <TResponse>(
            path: string,
            options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
        ) => request<TResponse>(path, { ...options, method: 'GET' }),

        post: <TResponse, TBody = unknown>(
            path: string,
            body?: TBody,
            options: Omit<ApiRequestOptions<TBody>, 'method' | 'body'> = {}
        ) => request<TResponse, TBody>(path, { ...options, method: 'POST', body }),

        put: <TResponse, TBody = unknown>(
            path: string,
            body?: TBody,
            options: Omit<ApiRequestOptions<TBody>, 'method' | 'body'> = {}
        ) => request<TResponse, TBody>(path, { ...options, method: 'PUT', body }),

        delete: <TResponse>(
            path: string,
            options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
        ) => request<TResponse>(path, { ...options, method: 'DELETE' }),
    };
};

export const apiClient = createApiClient({
    baseUrl: "http://localhost:3000",
    refreshPath: import.meta.env.VITE_API_REFRESH_URL || '/api/users/refresh',
    loginPath: import.meta.env.VITE_API_LOGIN_URL || '/api/users/login',
});
