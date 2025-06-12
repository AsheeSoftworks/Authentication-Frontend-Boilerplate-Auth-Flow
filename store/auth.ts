import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

// Base API endpoint from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * User object structure for authentication state
 */
interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Standardized structure for handling authentication errors
 */
interface AuthError {
  message: string;
  code?: string;
  field?: string;
  statusCode?: number;
}

/**
 * Authentication state management interface
 * Includes user info, authentication flags, and async actions
 */
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  resetToken: string | null;

  logIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    confirm_password: string
  ) => Promise<void>;
  logOut: () => Promise<void>;
  requestPasswordReset: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  resendVerificationEmail: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  passwordReset: (
    password: string,
    confirm_password: string,
    token: string
  ) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (
    token: string
  ) => Promise<{ success: boolean; message: string }>;
  googleLogin: (code: string) => Promise<void>;
  clearToken: () => void;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

/**
 * Initial state used for resetting or initializing the auth store
 */
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  resetToken: null,
};

/**
 * Utility function for transforming raw errors into standardized AuthError objects
 * Handles network errors, HTTP status codes, and unknown cases
 */
const handleAuthError = (error: unknown): AuthError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    if (!axiosError.response) {
      return {
        message: "Server is unreachable. Please try again later.",
        code: "NETWORK_ERROR",
      };
    }

    switch (axiosError.response.status) {
      case 400:
        return {
          message: axiosError.response.data?.message || "Invalid request data",
          code: "INVALID_REQUEST",
          field: axiosError.response.data?.field,
          statusCode: 400,
        };
      case 401:
        return {
          message: axiosError.response.data?.message || "Invalid credentials",
          code: "UNAUTHORIZED",
          statusCode: 401,
        };
      case 403:
        return {
          message: axiosError.response.data?.message || "Access forbidden",
          code: "FORBIDDEN",
          statusCode: 403,
        };
      case 404:
        return {
          message: axiosError.response.data?.message || "Resource not found",
          code: "NOT_FOUND",
          statusCode: 404,
        };
      case 409:
        return {
          message:
            axiosError.response.data?.message || "Resource already exists",
          code: "CONFLICT",
          field: axiosError.response.data?.field,
          statusCode: 409,
        };
      case 422:
        return {
          message: axiosError.response.data?.message || "Validation failed",
          code: "VALIDATION_ERROR",
          field: axiosError.response.data?.field,
          statusCode: 422,
        };
      case 429:
        return {
          message: "Too many requests. Please try again later.",
          code: "RATE_LIMITED",
          statusCode: 429,
        };
      case 500:
        return {
          message: "Server error. Please try again later.",
          code: "SERVER_ERROR",
          statusCode: 500,
        };
      default:
        return {
          message:
            axiosError.response.data?.message || "An unexpected error occurred",
          code: "UNKNOWN_ERROR",
          statusCode: axiosError.response.status,
        };
    }
  }

  if (error instanceof Error) {
    if (error.message.includes("Network Error")) {
      return {
        message: "Network error. Please check your connection.",
        code: "NETWORK_ERROR",
      };
    }
    return {
      message: error.message,
      code: "GENERIC_ERROR",
    };
  }

  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
};

/**
 * Zustand authentication store using persistence middleware
 * Persists essential auth state to localStorage and handles user sessions
 */
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Registers a new user account
       * Performs basic client-side validation before submitting to API
       */
      signUp: async (name, email, password, confirm_password) => {
        try {
          set({ isLoading: true, error: null });

          if (!name.trim()) throw new Error("Name is required");
          if (!email.trim()) throw new Error("Email is required");
          if (password !== confirm_password)
            throw new Error("Passwords do not match");

          const response = await axios.post(`${API_URL}/api/auth/register`, {
            email: email.trim(),
            password,
            name: name.trim(),
            confirm_password,
          });

          const user = response.data;

          set({
            user,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const authError = handleAuthError(error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: authError,
          });
          throw authError;
        }
      },

      /**
       * Authenticates a user using email and password
       * Sets auth token and persists it via cookies
       */
      logIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          if (!email.trim()) throw new Error("Email is required");
          if (!password) throw new Error("Password is required");

          const response = await axios.post(`${API_URL}/api/auth/login`, {
            email: email.trim(),
            password,
          });

          const { user, token } = response.data;

          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          Cookies.set("auth-token", token, {
            expires: 7,
            path: "/",
            sameSite: "Lax",
          });

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const authError = handleAuthError(error);
          delete axios.defaults.headers.common["Authorization"];
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: authError,
          });
          throw authError;
        }
      },

      /**
       * Clears token from state
       * Typically used before logout or token refresh
       */
      clearToken: () => set({ token: null }),

      /**
       * Logs out the current user
       * Clears local storage, cookies, and auth headers
       */
      logOut: async () => {
        try {
          const token = get().token;
          if (token) {
            await Cookies.remove("auth-token");
            await localStorage.removeItem("auth-storage");
            delete axios.defaults.headers.common["Authorization"];

            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });
          }
        } catch (error) {
          console.warn("Logout error:", error);
        }
      },

      /**
       * Requests a password reset link to be sent to the user's email
       */
      requestPasswordReset: async (email) => {
        try {
          set({ isLoading: true, error: null });

          if (!email.trim()) throw new Error("Email is required");

          await axios.post(`${API_URL}/api/auth/request-password-reset`, {
            email: email.trim(),
          });

          set({ isLoading: false });

          return { success: true, message: "Password reset email sent" };
        } catch (error) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError });
          throw authError;
        }
      },

      /**
       * Resends email verification to the specified user email
       */
      resendVerificationEmail: async (email) => {
        try {
          set({ isLoading: true, error: null });

          if (!email.trim()) throw new Error("Email is required");

          await axios.post(`${API_URL}/api/auth/resend-verification`, {
            email: email.trim(),
          });

          set({ isLoading: false });
          return { success: true, message: "Verification email sent" };
        } catch (error) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError });
          throw authError;
        }
      },

      /**
       * Verifies the user's email using a token
       */
      verifyEmail: async (token) => {
        try {
          set({ isLoading: true, error: null });

          if (!token) throw new Error("Verification token is required");

          await axios.post(`${API_URL}/api/auth/verify/${token}`);

          set({ isLoading: false });
          return { success: true, message: "Email verified successfully" };
        } catch (error) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError });
          throw authError;
        }
      },

      /**
       * Resets the user's password using the provided token and new password
       */
      passwordReset: async (password, confirm_password, token) => {
        try {
          set({ isLoading: true, error: null });

          if (!password) throw new Error("Password is required");
          if (password !== confirm_password)
            throw new Error("Passwords do not match");
          if (!token) throw new Error("Reset token is required");

          await axios.post(`${API_URL}/api/auth/reset-password`, {
            password,
            confirm_password,
            token,
          });

          set({ isLoading: false });
          return { success: true, message: "Password reset successfully" };
        } catch (error) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError });
          throw authError;
        }
      },

      /**
       * Authenticates user via Google OAuth using a code
       */
      googleLogin: async (code) => {
        try {
          set({ isLoading: true, error: null });

          if (!code) throw new Error("Google authentication code is required");

          const response = await axios.post(
            `${API_URL}/api/auth/google/login`,
            { code }
          );

          const { user, token } = response.data;

          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          Cookies.set("auth-token", token, {
            expires: 7,
            path: "/",
            sameSite: "Lax",
          });

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const authError = handleAuthError(error);
          set({ isLoading: false, error: authError });
          throw authError;
        }
      },

      /**
       * Clears any authentication error messages from state
       */
      clearError: () => set({ error: null }),

      /**
       * Refreshes the current session token
       * If it fails, the user is logged out automatically
       */
      refreshToken: async () => {
        const { token } = get();

        if (!token) throw new Error("No token to refresh");

        try {
          set({ isLoading: true });

          const response = await axios.post(
            `${API_URL}/api/auth/refresh-token`,
            { token }
          );

          const { token: newToken } = response.data;

          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          Cookies.set("auth-token", newToken, {
            expires: 7,
            path: "/",
            sameSite: "Lax",
          });

          set({ token: newToken, isLoading: false, error: null });
        } catch (error) {
          const authError = handleAuthError(error);
          console.error("Token refresh failed:", authError);
          get().logOut();
          throw authError;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;

/**
 * Axios response interceptor to handle token expiration globally
 * Automatically tries to refresh token on 401 errors
 */
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshToken();
        const token = useAuthStore.getState().token;
        if (token) {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        useAuthStore.getState().logOut();
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Initializes Axios with token from store (used on initial app load)
 */
const initializeAuth = () => {
  const token = useAuthStore.getState().token;
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

initializeAuth();
