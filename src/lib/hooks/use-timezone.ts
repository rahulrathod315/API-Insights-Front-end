import { useAuth } from '@/lib/auth/auth-context'

export function useTimezone(): string {
  const { user } = useAuth()
  return user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
}
