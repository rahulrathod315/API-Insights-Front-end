export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user?: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  tokens?: {
    access: string
    refresh: string
  }
  two_factor_required?: boolean
  challenge_token?: string
}

export interface RegisterRequest {
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
  company_name?: string
}

export interface RegisterResponse {
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
    company_name: string
  }
  tokens: {
    access: string
    refresh: string
  }
}

export interface TwoFactorChallengeRequest {
  code: string
  challenge_token: string
}

export interface TwoFactorChallengeResponse {
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  tokens: {
    access: string
    refresh: string
  }
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

export interface VerifyEmailRequest {
  token: string
}
