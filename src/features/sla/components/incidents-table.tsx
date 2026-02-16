import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime, formatPercent, formatMs } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { useSLAIncidents } from '../hooks'
import { ChevronDown, AlertCircle, Server, Clock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { DowntimeIncident } from '../types'

interface IncidentsTableProps {
  projectId: string
  slaId: string
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

function IncidentRow({ incident, tz }: { incident: DowntimeIncident; tz?: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const errorCodesArray = Object.entries(incident.error_codes || {}).sort(
    ([, a], [, b]) => b - a
  )

  return (
    <div className="rounded-lg border">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full">
          <div className="grid grid-cols-7 gap-4 p-4 text-sm hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
              <span className="font-medium">{formatDateTime(incident.started_at, tz)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium tabular-nums">{formatDuration(incident.duration_seconds)}</span>
            </div>
            <div>
              <Badge variant="secondary">{incident.root_cause_display}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {incident.affected_endpoints.length} endpoint{incident.affected_endpoints.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="text-right">
              <span className="text-destructive font-medium">{formatPercent(incident.avg_error_rate)}</span>
            </div>
            <div className="text-right">
              <span className="font-medium">{formatMs(incident.avg_response_time)}</span>
            </div>
            <div className="text-right">
              <Badge variant={incident.is_resolved ? 'default' : 'destructive'}>
                {incident.is_resolved ? 'Resolved' : 'Ongoing'}
              </Badge>
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="border-t bg-muted/30 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Error Codes Distribution */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <AlertCircle className="h-4 w-4" />
                  Error Codes
                </h4>
                {errorCodesArray.length > 0 ? (
                  <div className="space-y-2">
                    {errorCodesArray.map(([code, count]) => (
                      <div key={code} className="flex items-center justify-between rounded-md border bg-background p-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="font-mono">
                            {code}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {count} occurrence{count !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-destructive"
                            style={{
                              width: `${(count / Object.values(incident.error_codes).reduce((a, b) => a + b, 0)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No error codes recorded</p>
                )}
              </div>

              {/* Affected Endpoints */}
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <Server className="h-4 w-4" />
                  Affected Endpoints
                </h4>
                {incident.affected_endpoints.length > 0 ? (
                  <div className="space-y-1">
                    {incident.affected_endpoints.map((endpoint, idx) => (
                      <div key={idx} className="rounded-md border bg-background px-3 py-2">
                        <code className="text-sm">{endpoint}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">All endpoints affected</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-4 rounded-lg border bg-background p-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Started:</span>{' '}
                  <span className="font-medium">{formatDateTime(incident.started_at, tz)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>{' '}
                  <span className="font-medium">{formatDuration(incident.duration_seconds)}</span>
                </div>
                {incident.ended_at && (
                  <div>
                    <span className="text-muted-foreground">Ended:</span>{' '}
                    <span className="font-medium">{formatDateTime(incident.ended_at, tz)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

function IncidentsTable({ projectId, slaId }: IncidentsTableProps) {
  const tz = useTimezone()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data, isLoading } = useSLAIncidents(projectId, slaId)

  const incidents = data?.incidents ?? []
  const paginatedIncidents = incidents.slice((page - 1) * pageSize, page * pageSize)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Downtime Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || incidents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Downtime Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No incidents recorded - excellent uptime! 🎉
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Downtime Incidents
          <span className="ml-2 font-normal text-muted-foreground">
            ({data.total_incidents} total)
          </span>
        </CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          Click on an incident to view detailed information
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-7 gap-4 px-4 text-xs font-medium text-muted-foreground">
            <div>Started At</div>
            <div>Duration</div>
            <div>Root Cause</div>
            <div>Endpoints</div>
            <div className="text-right">Error Rate</div>
            <div className="text-right">Avg Response</div>
            <div className="text-right">Status</div>
          </div>

          {/* Incidents */}
          {paginatedIncidents.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} tz={tz} />
          ))}

          {/* Pagination Controls */}
          {incidents.length > pageSize && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, incidents.length)} of{' '}
                {incidents.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(Math.ceil(incidents.length / pageSize), p + 1))}
                  disabled={page >= Math.ceil(incidents.length / pageSize)}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { IncidentsTable }
