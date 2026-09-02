import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiEnvelope, ApiErrorEnvelope } from './types';

/**
 * FRONTEND-01 §9 — "Never access the database directly, communicate only
 * through backend APIs." All requests go through this single instance.
 *
 * withCredentials: true is required because the refresh token is an
 * httpOnly cookie set by the backend (src/utils/cookies.ts). Without this,
 * the browser will never send or receive that cookie cross-origin.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory access token. Never persisted to localStorage/sessionStorage —
// XSS-readable storage would defeat the point of a short-lived JWT.
let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Queue requests that arrive while a refresh is already in flight, so
// concurrent 401s don't trigger a refresh storm.
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorEnvelope>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest._retry = true;
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<ApiEnvelope<{ accessToken: string }>>('/auth/refresh');
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        onRefreshed(null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/** Extracts a user-facing message from any API error, never a raw stack trace. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as (ApiErrorEnvelope & { details?: any; errors?: any }) | undefined;

    // Extract field-level validation errors if present
    const fieldErrors = data?.errors || data?.details;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const messages: string[] = [];
      for (const [key, val] of Object.entries(fieldErrors)) {
        if (Array.isArray(val) && val.length > 0) {
          const cleanKey = key.replace(/^(body|query|params)\./, '');
          const label = cleanKey
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
          messages.push(`${label}: ${val[0]}`);
        } else if (typeof val === 'string' && val.trim()) {
          messages.push(val.trim());
        }
      }
      if (messages.length > 0) {
        return messages.join(' • ');
      }
    }

    if (data?.message && data.message !== 'Validation failed.') {
      return data.message;
    }

    if (data?.message) {
      return data.message;
    }

    if (error.code === 'ERR_NETWORK') return 'Unable to reach the server. Check your connection and try again.';
  } else if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
