import { apiClient } from '@/lib/api/client'
import type {
  Profile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyResponse,
  TwoFactorStatus,
  Session,
  SecurityEvents,
  NotificationPreferences,
} from './types'

export async function getProfile(): Promise<Profile> {
  const response = await apiClient.get<Profile>('/api/v1/auth/profile/')
  return response.data
}

export async function updateProfile(data: UpdateProfileRequest): Promise<Profile> {
  const response = await apiClient.patch<Profile>('/api/v1/auth/profile/', data)
  return response.data
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.post('/api/v1/auth/change-password/', data)
}

export async function setup2FA(): Promise<TwoFactorSetupResponse> {
  const response = await apiClient.post<TwoFactorSetupResponse>('/api/v1/auth/2fa/setup/')
  return response.data
}

export async function verify2FASetup(data: { code: string }): Promise<TwoFactorVerifyResponse> {
  const response = await apiClient.post<TwoFactorVerifyResponse>('/api/v1/auth/2fa/verify-setup/', data)
  return response.data
}

export async function get2FAStatus(): Promise<TwoFactorStatus> {
  const response = await apiClient.get<TwoFactorStatus>('/api/v1/auth/2fa/status/')
  return response.data
}

export async function disable2FA(data: { password: string }): Promise<void> {
  await apiClient.post('/api/v1/auth/2fa/disable/', data)
}

export async function regenerateRecoveryCodes(data: { password: string }): Promise<{ recovery_codes: string[]; message: string }> {
  const response = await apiClient.post<{ recovery_codes: string[]; message: string }>('/api/v1/auth/2fa/recovery-codes/regenerate/', data)
  return response.data
}

export async function getSessions(): Promise<Session[]> {
  const response = await apiClient.get<Session[]>('/api/v1/auth/sessions/')
  return response.data
}

export async function revokeSession(jti: string): Promise<void> {
  await apiClient.delete(`/api/v1/auth/sessions/${jti}/`)
}

export async function revokeAllSessions(): Promise<void> {
  await apiClient.post('/api/v1/auth/sessions/revoke-all/')
}

export async function getNotifications(): Promise<NotificationPreferences> {
  const response = await apiClient.get<NotificationPreferences>('/api/v1/auth/notifications/')
  return response.data
}

export async function updateNotifications(
  data: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const response = await apiClient.patch<NotificationPreferences>(
    '/api/v1/auth/notifications/',
    data
  )
  return response.data
}

export async function getSecurityEvents(): Promise<SecurityEvents> {
  const response = await apiClient.get<SecurityEvents>('/api/v1/auth/security-events/')
  return response.data
}

export async function resendVerificationEmail(): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    '/api/v1/auth/verify-email/resend/'
  )
  return response.data
}

export async function deactivateAccount(): Promise<void> {
  await apiClient.post('/api/v1/auth/account/deactivate/')
}

export async function requestDataExport(): Promise<void> {
  await apiClient.post('/api/v1/auth/account/request-data-export/')
}

export async function requestDeletion(): Promise<void> {
  await apiClient.post('/api/v1/auth/account/request-deletion/')
}
