import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { Notify } from 'quasar';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token if needed (for Laravel)
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken.getAttribute('content') || '';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Any status code that lies within the range of 2xx causes this function to trigger
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // Handle network errors
    if (!error.response) {
      Notify.create({
        type: 'negative',
        message: 'Network error. Please check your connection.',
        position: 'top',
      });
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', {
            refresh_token: refreshToken,
          });

          const { token } = response.data.data;
          localStorage.setItem('auth_token', token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      Notify.create({
        type: 'negative',
        message: 'You do not have permission to perform this action.',
        position: 'top',
      });
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      Notify.create({
        type: 'negative',
        message: 'Resource not found.',
        position: 'top',
      });
    }

    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      Notify.create({
        type: 'warning',
        message: 'Too many requests. Please slow down.',
        position: 'top',
      });
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      Notify.create({
        type: 'negative',
        message: 'Server error. Please try again later.',
        position: 'top',
      });
    }

    // Handle validation errors (422)
    if (error.response?.status === 422) {
      const validationErrors = (error.response.data as any)?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0];
        const message = Array.isArray(firstError) ? firstError[0] : firstError;

        Notify.create({
          type: 'negative',
          message: message as string,
          position: 'top',
        });
      }
    }

    return Promise.reject(error);
  },
);

export default defineBoot(({ app }) => {
  // Make axios available globally
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
