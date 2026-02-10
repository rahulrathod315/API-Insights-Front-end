import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { apiClient } from '@/lib/api/client'
import { tokenManager } from '@/lib/auth/token-manager'

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  company_name: string
  is_email_verified: boolean
  is_two_factor_enabled: boolean
  display_name: string | null
  timezone: string | null
  locale: string | null
  default_landing_page: string | null
  avatar_url: string | null
  date_joined: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

interface LoginResult {
  success: boolean
  two_factor_required?: boolean
  challenge_token?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!tokenManager.isAuthenticated()) {
      setUser(null)
      setIsLoading(false)
      return
    }
    try {
      const { data } = await apiClient.get('/api/v1/auth/profile/')
      setUser(data)
    } catch {
      tokenManager.clearTokens()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    const { data } = await apiClient.post('/api/v1/auth/login/', { email, password })

    if (data.two_factor_required) {
      tokenManager.setChallengeToken(data.challenge_token)
      return { success: true, two_factor_required: true, challenge_token: data.challenge_token }
    }

    tokenManager.setTokens(data.tokens.access, data.tokens.refresh)
    await refreshUser()
    return { success: true }
  }, [refreshUser])

  const logout = useCallback(async () => {
    try {
      const refreshToken = tokenManager.getRefreshToken()
      if (refreshToken) {
        await apiClient.post('/api/v1/auth/logout/', { refresh: refreshToken })
      }
    } catch {
      // Logout API may fail but we still clear tokens
    } finally {
      tokenManager.clearTokens()
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
