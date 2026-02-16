import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StaggerGroup, StaggerItem } from '@/components/animation/stagger-group'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { StatusBreakdown } from '@/features/analytics/components/status-breakdown'
import { cn } from '@/lib/utils/cn'
import { formatDate, formatNumber, formatMs, formatBytes } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { useEndpointMetrics } from '../hooks'
import {
  X,
  BarChart3,
  Pencil,
  Trash2,
  Activity,
  Clock,
  AlertTriangle,
  Zap,
  Database,
} from 'lucide-react'
import { useProjectContext } from '@/features/projects/project-context'
import {
  
  
  Bar,
  BarChart,
  CartesianGrid,
  
  
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Endpoint } from '../types'

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-primary/10 text-primary',
  POST: 'bg-primary/15 text-primary',
  PUT: 'bg-primary/10 text-primary',
  PATCH: 'bg-primary/10 text-primary',
  DELETE: 'bg-primary/10 text-primary',
  HEAD: 'bg-primary/10 text-primary',
  OPTIONS: 'bg-muted text-muted-foreground',
}

interface EnhancedEndpointDetailPanelProps {
  endpoint: Endpoint
  onClose: () => void
  onEdit: (endpoint: Endpoint) => void
  onDelete: (endpoint: Endpoint) => void
}

export function EnhancedEndpointDetailPanel({
  endpoint,
  onClose,
  onEdit,
  onDelete,
}: EnhancedEndpointDetailPanelProps) {
  const { project } = useProjectContext()
  const tz = useTimezone()

  // Fetch endpoint analytics data
  const { data: metrics, isLoading } = useEndpointMetrics(
    String(project.id),
    String(endpoint.id),
    { days: 7 }
  )

  const summary = metrics?.summary
  const percentiles = metrics?.percentiles
  const statusDistribution = metrics?.status_distribution ?? []
  const hourlyDistribution = metrics?.hourly_distribution ?? []
  const recentErrors = metrics?.recent_errors ?? []

  // Convert status distribution to status breakdown format
  const statusBreakdown = statusDistribution.reduce((acc, item) => {
    const statusCode = String(item.status_code)
    acc[statusCode] = item.count
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex h-full flex-col border-l bg-background overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-semibold">Endpoint Analytics</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close panel</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Method + Path */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'border-0 font-mono text-xs font-bold',
                  METHOD_COLORS[endpoint.method]
                )}
              >
                {endpoint.method}
              </Badge>
              <span className="font-mono text-sm font-medium break-words">
                {endpoint.path}
              </span>
            </div>
            {endpoint.name && (
              <p className="text-sm font-medium">{endpoint.name}</p>
            )}
            {endpoint.description && (
              <p className="text-sm text-muted-foreground">
                {endpoint.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Performance Summary */}
          {isLoading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : summary ? (
            <>
              <div>
                <h3 className="mb-3 text-sm font-semibold">Performance Summary</h3>
                <StaggerGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StaggerItem>
                    <StatCard
                      title="Total Requests"
                      value={formatNumber(summary.total_requests)}
                      icon={Activity}
                      iconClassName="bg-primary/10 text-primary"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <StatCard
                      title="Avg Response"
                      value={formatMs(summary.avg_response_time_ms)}
                      icon={Clock}
                      iconClassName="bg-chart-2/10 text-chart-2"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <StatCard
                      title="P95 Latency"
                      value={formatMs(percentiles?.p95 ?? 0)}
                      icon={Zap}
                      iconClassName="bg-chart-3/10 text-chart-3"
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <StatCard
                      title="Avg Payload"
                      value={formatBytes(summary.avg_response_size_bytes ?? 0)}
                      icon={Database}
                      iconClassName="bg-chart-4/10 text-chart-4"
                    />
                  </StaggerItem>
                </StaggerGroup>
              </div>

              <Separator />

              {/* Response Time Percentiles Chart */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">Response Time Percentiles</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">P50</span>
                        <span className="font-mono font-medium">{formatMs(percentiles?.p50 ?? 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">P90</span>
                        <span className="font-mono font-medium">{formatMs(percentiles?.p90 ?? 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">P95</span>
                        <span className="font-mono font-medium">{formatMs(percentiles?.p95 ?? 0)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">P99</span>
                        <span className="font-mono font-medium">{formatMs(percentiles?.p99 ?? 0)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t pt-2 text-sm">
                        <span className="text-muted-foreground">Min</span>
                        <span className="font-mono font-medium">{formatMs(summary.min_response_time_ms)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Max</span>
                        <span className="font-mono font-medium">{formatMs(summary.max_response_time_ms)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              {/* Status Distribution */}
              {Object.keys(statusBreakdown).length > 0 && (
                <>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Status Distribution</h3>
                    <StatusBreakdown data={statusBreakdown} isLoading={false} />
                  </div>
                  <Separator />
                </>
              )}

              {/* Hourly Traffic Pattern */}
              {hourlyDistribution.length > 0 && (
                <>
                  <div>
                    <h3 className="mb-3 text-sm font-semibold">Hourly Traffic Pattern</h3>
                    <Card>
                      <CardContent className="p-4">
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={hourlyDistribution}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                              dataKey="hour"
                              className="text-xs"
                              tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <YAxis
                              className="text-xs"
                              tick={{ fill: 'hsl(var(--muted-foreground))' }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px',
                              }}
                              formatter={(value: number | undefined) => [formatNumber(value ?? 0), 'Requests']}
                            />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                  <Separator />
                </>
              )}

              {/* Recent Errors */}
              {recentErrors.length > 0 && (
                <>
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Recent Errors ({recentErrors.length})
                    </h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {recentErrors.slice(0, 5).map((error) => (
                            <div key={error.id} className="p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <Badge variant="destructive" className="font-mono text-xs">
                                  {error.status_code}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(error.timestamp, tz)}
                                </span>
                              </div>
                              {error.error_message && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {error.error_message}
                                </p>
                              )}
                              <p className="mt-1 font-mono text-xs text-muted-foreground">
                                {error.ip_address}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Separator />
                </>
              )}
            </>
          ) : null}

          {/* Status + Dates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={endpoint.is_active ? 'success' : 'secondary'}>
                {endpoint.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{formatDate(endpoint.created_at, tz)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Updated</span>
              <span className="text-sm">{formatDate(endpoint.updated_at, tz)}</span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link
                to={`/projects/${project.id}/analytics/endpoints/${endpoint.id}`}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Full Analytics
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onEdit(endpoint)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Endpoint
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-primary hover:text-primary"
              onClick={() => onDelete(endpoint)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Endpoint
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
