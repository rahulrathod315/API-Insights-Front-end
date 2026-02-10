import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProfile,
  updateProfile,
  changePassword,
  setup2FA,
  verify2FASetup,
  get2FAStatus,
  disable2FA,
  regenerateRecoveryCodes,
  getSessions,
  revokeSession,
  revokeAllSessions,
  getNotifications,
  updateNotifications,
  getSecurityEvents,
  deactivateAccount,
  requestDataExport,
  requestDeletion,
} from './api'
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationPreferences,
} from './types'

const settingsKeys = {
  profile: ['settings', 'profile'] as const,
  twoFactorStatus: ['settings', '2fa-status'] as const,
  recoveryCodes: ['settings', 'recovery-codes'] as const,
  sessions: ['settings', 'sessions'] as const,
  notifications: ['settings', 'notifications'] as const,
  securityEvents: ['settings', 'security-events'] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: settingsKeys.profile,
    queryFn: getProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  })
}

export function useSetup2FA() {
  return useMutation({
    mutationFn: () => setup2FA(),
  })
}

export function useVerify2FASetup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { code: string }) => verify2FASetup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.twoFactorStatus })
    },
  })
}

export function use2FAStatus() {
  return useQuery({
    queryKey: settingsKeys.twoFactorStatus,
    queryFn: get2FAStatus,
  })
}

export function useDisable2FA() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { password: string }) => disable2FA(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.twoFactorStatus })
    },
  })
}

export function useRegenerateRecoveryCodes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { password: string }) => regenerateRecoveryCodes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.recoveryCodes })
      queryClient.invalidateQueries({ queryKey: settingsKeys.twoFactorStatus })
    },
  })
}

export function useSessions() {
  return useQuery({
    queryKey: settingsKeys.sessions,
    queryFn: getSessions,
  })
}

export function useRevokeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jti: string) => revokeSession(jti),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions })
    },
  })
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => revokeAllSessions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions })
    },
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: settingsKeys.notifications,
    queryFn: getNotifications,
  })
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<NotificationPreferences>) => updateNotifications(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.notifications })
    },
  })
}

export function useSecurityEvents() {
  return useQuery({
    queryKey: settingsKeys.securityEvents,
    queryFn: getSecurityEvents,
  })
}

export function useDeactivateAccount() {
  return useMutation({
    mutationFn: () => deactivateAccount(),
  })
}

export function useRequestDataExport() {
  return useMutation({
    mutationFn: () => requestDataExport(),
  })
}

export function useRequestDeletion() {
  return useMutation({
    mutationFn: () => requestDeletion(),
  })
}
