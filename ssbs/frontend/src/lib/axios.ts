// ── Axios HTTP client with JWT interceptors ──

import axios, { type InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS, API_ENDPOINTS } from '../config/api.config';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: attach Bearer token ──
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ──
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for token endpoints themselves
    const isTokenEndpoint =
      originalRequest?.url?.includes('/accounts/token/') ||
      originalRequest?.url?.includes('/accounts/token/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isTokenEndpoint) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refresh) {
        // No refresh token → clear and redirect
        clearAuth();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}${API_ENDPOINTS.auth.refresh}`,
          { refresh },
        );

        const newAccess: string = data.access;
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccess);

        // If backend returns rotated refresh token
        if (data.refresh) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
        }

        processQueue(null, newAccess);
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

/** Clear tokens + redirect to landing */
function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  // Redirect to landing page — avoid infinite loops
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
}

export default api;
