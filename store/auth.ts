import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthError {
  message: string;
  code?: string;
  field?: string;
  statusCode?: number;
}

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

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  resetToken: null,
};

// Enhanced error handler utility
const handleAuthError = (error: unknown): AuthError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    // No response = server is likely offline or unreachable
    if (!axiosError.response) {
      return {
        message: "Server is unreachable. Please try again later.",
        code: "NETWORK_ERROR",
      };
    }

    // Handle specific HTTP status codes
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

  // Handle non-Axios errors
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

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Enhanced Sign up Logic
      signUp: async (name, email, password, confirm_password) => {
        try {
          set({ isLoading: true, error: null });

          // Client-side validation
          if (!name.trim()) {
            throw new Error("Name is required");
          }
          if (!email.trim()) {
            throw new Error("Email is required");
          }
          if (password !== confirm_password) {
            throw new Error("Passwords do not match");
          }

          const response = await axios.post(`${API_URL}/api/auth/register`, {
            email: email.trim(),
            password,
            name: name.trim(),
            confirm_password,
          });

          console.log(response.status);

          const user = response.data;

          set({
            user,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.log("AuthState Error: ", error);
          const authError = handleAuthError(error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: authError,
          });
          throw authError; // Re-throw for component handling
        }
      },

      // Enhanced Log in logic
      logIn: async (email, password) => {
        try {
          set({ isLoading: true, error: null });

          // Client-side validation
          if (!email.trim()) {
            throw new Error("Email is required");
          }
          if (!password) {
            throw new Error("Password is required");
          }

          const response = await axios.post(`${API_URL}/api/auth/login`, {
            email: email.trim(),
            password,
          });

          const { user, token } = response.data;

          // Set authorization header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          Cookies.set("auth-token", token, {
            expires: 7, // in days
            path: "/",
            // secure: true,
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

          // Clear any existing auth data on login failure
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

      clearToken: () => set({ token: null }),

      // Enhanced Sign out action
      logOut: async () => {
        try {
          console.log("start");
          const token = get().token;

          if (token) {
            // Remove auth token from storage and state
            await Cookies.remove("auth-token");
            await localStorage.removeItem("auth-storage");

            set({
              user: null,
              token: null,
              isAuthenticated: false,
              error: null,
            });

            // Optionally remove Authorization header globally
            delete axios.defaults.headers.common["Authorization"];

            console.log("logged out");
          }
        } catch (error) {
          console.warn("Logout error:", error);
        }
      },

      // Enhanced Request Password Reset Logic
      requestPasswordReset: async (email) => {
        try {
          set({ isLoading: true, error: null });

          if (!email.trim()) {
            throw new Error("Email is required");
          }

          await axios.post(`${API_URL}/api/auth/request-password-reset`, {
            email: email.trim(),
          });

          set({ isLoading: false });

          // Return success indicator
          return { success: true, message: "Password reset email sent" };
        } catch (error) {
          const authError = handleAuthError(error);
          set({
            isLoading: false,
            error: authError,
          });
          throw authError;
        }
      },

      // Enhanced Resend Verification Email Logic
      resendVerificationEmail: async (email) => {
        try {
          set({ isLoading: true, error: null });

          if (!email.trim()) {
            throw new Error("Email is required");
          }

          const response = await axios.post(
            `${API_URL}/api/auth/resend-verification`,
            { email: email.trim() }
          );

          set({ isLoading: false });
          return { success: true, message: "Verification email sent" };
        } catch (error) {
          const authError = handleAuthError(error);
          set({
            isLoading: false,
            error: authError,
          });
          throw authError;
        }
      },

      // Enhanced Email Verification Logic
      verifyEmail: async (token) => {
        try {
          set({ isLoading: true, error: null });

          if (!token) {
            throw new Error("Verification token is required");
          }

          const response = await axios.post(
            `${API_URL}/api/auth/verify/${token}`
          );

          set({ isLoading: false });
          return { success: true, message: "Email verified successfully" };
        } catch (error) {
          const authError = handleAuthError(error);
          set({
            isLoading: false,
            error: authError,
          });
          throw authError;
        }
      },

      // Enhanced Password Reset Logic
      passwordReset: async (password, confirm_password, token) => {
        try {
          set({ isLoading: true, error: null });

          // Client-side validation
          if (!password) {
            throw new Error("Password is required");
          }
          if (password !== confirm_password) {
            throw new Error("Passwords do not match");
          }
          if (!token) {
            throw new Error("Reset token is required");
          }

          await axios.post(`${API_URL}/api/auth/reset-password`, {
            password,
            confirm_password,
            token,
          });

          set({ isLoading: false });
          return { success: true, message: "Password reset successfully" };
        } catch (error) {
          const authError = handleAuthError(error);
          set({
            isLoading: false,
            error: authError,
          });
          throw authError;
        }
      },

      // Enhanced Google Login
      googleLogin: async (code) => {
        try {
          set({ isLoading: true, error: null });

          if (!code) {
            throw new Error("Google authentication code is required");
          }

          const response = await axios.post(
            `${API_URL}/api/auth/google/login`,
            {
              code,
            }
          );

          const { user, token } = response.data;

          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          Cookies.set("auth-token", token, {
            expires: 7, // in days
            path: "/",
            // secure: true,
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
          set({
            isLoading: false,
            error: authError,
          });
          throw authError;
        }
      },

      // Clear error - now synchronous
      clearError: () => set({ error: null }),

      // Enhanced Refresh token
      refreshToken: async () => {
        const { token } = get();

        if (!token) {
          throw new Error("No token to refresh");
        }

        try {
          set({ isLoading: true });

          const response = await axios.post(
            `${API_URL}/api/auth/refresh-token`,
            {
              token,
            }
          );

          const { token: newToken } = response.data;

          axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

          Cookies.set("auth-token", newToken, {
            expires: 7, // in days
            path: "/",
            // secure: true,
            sameSite: "Lax",
          });

          set({
            token: newToken,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // If refresh fails, log out user
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

// Enhanced axios interceptor with better error handling
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await useAuthStore.getState().refreshToken();

        // Retry the original request with new token
        const token = useAuthStore.getState().token;
        if (token) {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login or show error
        console.error("Token refresh failed:", refreshError);
        useAuthStore.getState().logOut();
      }
    }

    return Promise.reject(error);
  }
);

// Initialize auth header if we have a token on page load
const initializeAuth = () => {
  const token = useAuthStore.getState().token;
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// Call initialization
initializeAuth();
