import axios from 'axios';
import useAuthStore from '@/store/auth';

// Base URL for API endpoints, loaded from environment configuration
const API_URL = process.env.API_URL;

// Create a custom Axios instance for consistent API interaction
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Set a timeout for all requests (in milliseconds)
  headers: {
    'Content-Type': 'application/json', // Ensure JSON payload format for requests
  }
});

/**
 * Request interceptor to attach the bearer token (if available)
 * Ensures all outgoing requests include authorization when the user is logged in
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor to automatically handle expired tokens (401 errors)
 * If a token has expired and hasn't been retried, attempt to refresh the token and retry the request
 * Logs the user out if the refresh process fails
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Attempt token refresh only once per failed request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using the auth store
        await useAuthStore.getState().refreshToken();

        const token = useAuthStore.getState().token;

        if (token) {
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refreshing fails, log the user out and reject the original error
        useAuthStore.getState().logOut();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
