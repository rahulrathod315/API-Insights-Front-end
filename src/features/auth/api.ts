import { apiClient } from '@/lib/api/client'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TwoFactorChallengeRequest,
  TwoFactorChallengeResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from './types'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/v1/auth/login/', data)
  return response.data
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>('/api/v1/auth/register/', data)
  return response.data
}

export async function twoFactorChallenge(
  data: TwoFactorChallengeRequest
): Promise<TwoFactorChallengeResponse> {
  const response = await apiClient.post<TwoFactorChallengeResponse>(
    '/api/v1/auth/2fa/challenge/',
    data
  )
  return response.data
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/api/v1/auth/password-reset/',
    data
  )
  return response.data
}

export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/api/v1/auth/password-reset/confirm/',
    data
  )
  return response.data
}

export async function verifyEmail(data: VerifyEmailRequest): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/api/v1/auth/verify-email/',
    data
  )
  return response.data
}
