import { useState } from 'react'
import { Monitor, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { formatRelativeTime } from '@/lib/utils/format'
import { useSessions, useRevokeSession, useRevokeAllSessions } from '../hooks'
import type { Session } from '../types'

function parseUserAgent(ua: string): string {
  if (!ua) return 'Unknown Device'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  if (ua.includes('Opera')) return 'Opera'
  return ua.length > 40 ? ua.substring(0, 40) + '...' : ua
}

function SessionRow({ session }: { session: Session }) {
  const revokeSession = useRevokeSession()
  const [showConfirm, setShowConfirm] = useState(false)
  const browserName = parseUserAgent(session.user_agent)

  return (
    <>
      <tr className="border-b transition-colors hover:bg-muted/50">
        <td className="p-4 align-middle">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{browserName}</span>
            {session.is_current && (
              <Badge variant="success" className="text-xs">
                Current
              </Badge>
            )}
          </div>
        </td>
        <td className="p-4 align-middle">
          <span className="text-sm text-muted-foreground">{session.ip_address}</span>
        </td>
        <td className="p-4 align-middle">
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(session.created_at)}
          </span>
        </td>
        <td className="p-4 align-middle">
          <span className="text-sm text-muted-foreground">
            {formatRelativeTime(session.expires_at)}
          </span>
        </td>
        <td className="p-4 align-middle text-right">
          {!session.is_current && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={revokeSession.isPending}
            >
              {revokeSession.isPending && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              Revoke
            </Button>
          )}
        </td>
      </tr>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Revoke Session"
        description={`This will sign out the session from "${browserName}" at ${session.ip_address}. The user will need to sign in again.`}
        confirmLabel="Revoke Session"
        variant="destructive"
        onConfirm={() => {
          revokeSession.mutate(session.jti, {
            onSuccess: () => setShowConfirm(false),
          })
        }}
        isLoading={revokeSession.isPending}
      />
    </>
  )
}

function SessionsList() {
  const { data: sessions, isLoading } = useSessions()
  const revokeAllSessions = useRevokeAllSessions()
  const [showRevokeAll, setShowRevokeAll] = useState(false)

  const otherSessions = sessions?.filter((s) => !s.is_current) ?? []

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage your active sessions across devices.
            </CardDescription>
          </div>
          {otherSessions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevokeAll(true)}
              disabled={revokeAllSessions.isPending}
            >
              {revokeAllSessions.isPending && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              Revoke All Other Sessions
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <TableSkeleton />}

        {!isLoading && sessions && sessions.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No active sessions found.
          </p>
        )}

        {!isLoading && sessions && sessions.length > 0 && (
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Browser
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    IP Address
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Created
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Expires
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <SessionRow key={session.jti} session={session} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {revokeAllSessions.isSuccess && (
          <p className="mt-4 text-sm text-success">
            All other sessions have been revoked.
          </p>
        )}
        {revokeAllSessions.isError && (
          <p className="mt-4 text-sm text-destructive">
            Failed to revoke sessions. Please try again.
          </p>
        )}
      </CardContent>

      <ConfirmDialog
        open={showRevokeAll}
        onOpenChange={setShowRevokeAll}
        title="Revoke All Other Sessions"
        description="This will sign out all sessions except your current one. All other devices will need to sign in again."
        confirmLabel="Revoke All"
        variant="destructive"
        onConfirm={() => {
          revokeAllSessions.mutate(undefined, {
            onSuccess: () => setShowRevokeAll(false),
          })
        }}
        isLoading={revokeAllSessions.isPending}
      />
    </Card>
  )
}

export { SessionsList }
