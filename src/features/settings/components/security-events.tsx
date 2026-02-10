import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils/format'
import { getSecurityEvents } from '../api'
import type { SecurityEvents as SecurityEventsType } from '../types'

export function SecurityEvents() {
  const [data, setData] = useState<SecurityEventsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSecurityEvents().then((result: SecurityEventsType) => {
      setData(result)
      setIsLoading(false)
    }).catch(() => setIsLoading(false))
  }, [])

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
                  {data.last_login ? formatDateTime(data.last_login) : 'Never'}
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Last Password Change</p>
                <p className="text-sm">
                  {data.last_password_change_at ? formatDateTime(data.last_password_change_at) : 'Never'}
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
                      {formatDateTime(data.last_email_verification_at)}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Two-Factor Auth</p>
                <div className="flex items-center gap-2">
                  <Badge variant={data.is_two_factor_enabled ? 'success' : 'secondary'}>
                    {data.is_two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  {data.two_factor_verified_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(data.two_factor_verified_at)}
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
                      ? `Locked until ${formatDateTime(data.locked_until)}`
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
