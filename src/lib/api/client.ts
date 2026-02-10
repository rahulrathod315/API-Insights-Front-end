import axios from 'axios'
import { tokenManager } from '@/lib/auth/token-manager'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

// Request interceptor: attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: unwrap { success, data, message } envelope
apiClient.interceptors.response.use(
  (response) => {
    // The backend wraps all responses in { success: true, data: ..., message: ... }
    // Paginated responses have: { success: true, data: [...], pagination: {...} }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if ('pagination' in response.data) {
        // Paginated response — keep both data array and pagination info
        response.data = {
          results: response.data.data ?? [],
          pagination: response.data.pagination,
        }
      } else {
        // Regular response — unwrap the data field
        response.data = response.data.data ?? response.data
      }
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/v1/auth/token/refresh/') &&
      !originalRequest.url?.includes('/api/v1/auth/login/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = tokenManager.getRefreshToken()
      if (!refreshToken) {
        tokenManager.clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Token refresh uses raw axios (SimpleJWT returns { access } directly, no envelope)
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        tokenManager.setTokens(data.access, data.refresh || refreshToken)
        processQueue(null, data.access)

        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenManager.clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
