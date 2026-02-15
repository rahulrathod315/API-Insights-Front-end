import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { getSecurityEvents, resendVerificationEmail } from '../api'
import type { SecurityEvents as SecurityEventsType } from '../types'
import { isAxiosError } from 'axios'

export function SecurityEvents() {
  const tz = useTimezone()
  const [data, setData] = useState<SecurityEventsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  useEffect(() => {
    getSecurityEvents().then((result: SecurityEventsType) => {
      setData(result)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

  async function handleResendVerification() {
    setResendStatus('loading')
    setResendMessage(null)
    try {
      const result = await resendVerificationEmail()
      setResendStatus('success')
      setResendMessage(result.message || 'Verification email sent.')
    } catch (error: unknown) {
      setResendStatus('error')
      if (isAxiosError(error)) {
        const message =
          error.response?.data?.detail ??
          error.response?.data?.message ??
          'Unable to resend verification email. Please try again.'
        setResendMessage(message)
      } else {
        setResendMessage('Unable to resend verification email. Please try again.')
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">Unable to load security information.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p className="text-sm">
                  {data.last_login ? formatDateTime(data.last_login, tz) : 'Never'}
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Password Change</p>
                <p className="text-sm">
                  {data.last_password_change_at ? formatDateTime(data.last_password_change_at, tz) : 'Never'}
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                <div className="flex items-center gap-2">
                  <Badge variant={data.is_email_verified ? 'success' : 'warning'}>
                    {data.is_email_verified ? 'Verified' : 'Not Verified'}
                  </Badge>
                  {data.last_email_verification_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(data.last_email_verification_at, tz)}
                    </span>
                  )}
                </div>
                {!data.is_email_verified && (
                  <div className="mt-2 space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResendVerification}
                      disabled={resendStatus === 'loading'}
                    >
                      {resendStatus === 'loading'
                        ? 'Sending...'
                        : 'Resend Verification Email'}
                    </Button>
                    {resendMessage && (
                      <p
                        className={`text-xs ${resendStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}
                      >
                        {resendMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Two-Factor Auth</p>
                <div className="flex items-center gap-2">
                  <Badge variant={data.is_two_factor_enabled ? 'success' : 'secondary'}>
                    {data.is_two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  {data.two_factor_verified_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(data.two_factor_verified_at, tz)}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-sm">{data.active_session_count}</p>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Failed Login Attempts</p>
                <p className="text-sm">{data.failed_login_count}</p>
              </div>

              {data.is_locked && (
                <div className="rounded-lg border border-destructive p-4 space-y-1 sm:col-span-2">
                  <p className="text-sm font-medium text-destructive">Account Locked</p>
                  <p className="text-sm text-muted-foreground">
                    {data.locked_until
                      ? `Locked until ${formatDateTime(data.locked_until, tz)}`
                      : 'Account is currently locked.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
