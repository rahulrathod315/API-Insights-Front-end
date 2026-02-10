const ACCESS_TOKEN_KEY = 'api_insights_access_token'
const REFRESH_TOKEN_KEY = 'api_insights_refresh_token'
const CHALLENGE_TOKEN_KEY = 'api_insights_challenge_token'

export const tokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  getChallengeToken(): string | null {
    return localStorage.getItem(CHALLENGE_TOKEN_KEY)
  },

  setTokens(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },

  setChallengeToken(token: string): void {
    localStorage.setItem(CHALLENGE_TOKEN_KEY, token)
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(CHALLENGE_TOKEN_KEY)
  },

  clearChallengeToken(): void {
    localStorage.removeItem(CHALLENGE_TOKEN_KEY)
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY)
  },
}
