import axios from 'axios'
import useAuthStore from '@/store/auth'

const API_URL = process.env.API_URL

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle token expired errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        await useAuthStore.getState().refreshToken()
        
        // Retry the original request with the new token
        const token = useAuthStore.getState().token
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // If token refresh fails, sign out
        useAuthStore.getState().logOut()
        return Promise.reject(error)
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient