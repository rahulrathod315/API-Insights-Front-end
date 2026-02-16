import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { differenceInMinutes, parseISO } from 'date-fns'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Plus,
  Pencil,
  PowerOff,
  Power,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
} from 'lucide-react'
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'
import type { AlertHistory as AlertHistoryType, Alert } from '../types'

interface EnhancedAlertHistoryProps {
  alert: Alert
  history: AlertHistoryType[]
  isLoading: boolean
}

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

const eventTypeConfig: Record<
  AlertHistoryType['event_type'],
  { icon: typeof Info; label: string; textColor: string; iconColor: string; bgColor: string }
> = {
  triggered: {
    icon: AlertTriangle,
    label: 'Triggered',
    textColor: 'text-destructive',
    iconColor: 'text-destructive',
    bgColor: 'bg-destructive',
  },
  resolved: {
    icon: CheckCircle2,
    label: 'Resolved',
    textColor: 'text-success',
    iconColor: 'text-success',
    bgColor: 'bg-success',
  },
  acknowledged: {
    icon: Eye,
    label: 'Acknowledged',
    textColor: 'text-primary',
    iconColor: 'text-primary',
    bgColor: 'bg-primary',
  },
  created: {
    icon: Plus,
    label: 'Created',
    textColor: 'text-muted-foreground',
    iconColor: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  updated: {
    icon: Pencil,
    label: 'Updated',
    textColor: 'text-muted-foreground',
    iconColor: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  disabled: {
    icon: PowerOff,
    label: 'Disabled',
    textColor: 'text-warning',
    iconColor: 'text-warning',
    bgColor: 'bg-warning',
  },
  enabled: {
    icon: Power,
    label: 'Enabled',
    textColor: 'text-success',
    iconColor: 'text-success',
    bgColor: 'bg-success',
  },
}

export function EnhancedAlertHistory({ alert, history, isLoading }: EnhancedAlertHistoryProps) {
  const tz = useTimezone()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // Calculate metrics from history
  const metrics = useMemo(() => {
    const triggeredEvents = history.filter((e) => e.event_type === 'triggered')
    const resolvedEvents = history.filter((e) => e.event_type === 'resolved')

    let totalResolutionTime = 0
    let resolvedCount = 0

    // Calculate resolution times
    triggeredEvents.forEach((triggered) => {
      const resolved = resolvedEvents.find(
        (r) => parseISO(r.created_at) > parseISO(triggered.created_at)
      )
      if (resolved) {
        const resolutionMinutes = differenceInMinutes(
          parseISO(resolved.created_at),
          parseISO(triggered.created_at)
        )
        totalResolutionTime += resolutionMinutes
        resolvedCount++
      }
    })

    const avgResolutionMinutes = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0

    // Prepare chart data (metric value over time)
    const chartData = history
      .filter((e) => e.metric_value != null)
      .map((e) => ({
        timestamp: new Date(e.created_at).getTime(),
        value: e.metric_value,
        threshold: e.threshold_value ?? alert.threshold,
        event: e.event_type,
      }))
      .sort((a, b) => a.timestamp - b.timestamp)

    return {
      totalTriggers: triggeredEvents.length,
      totalResolved: resolvedCount,
      avgResolutionMinutes,
      chartData,
    }
  }, [history, alert.threshold])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-[200px]" />
        <div className="space-y-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[40%]" />
                <Skeleton className="h-3 w-[70%]" />
                <Skeleton className="h-3 w-[30%]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Info className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No history events yet.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(history.length / pageSize)
  const paginatedHistory = history.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-6">
      {/* Metric vs Threshold Chart */}
      {metrics.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Metric Value vs Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
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
                  labelFormatter={(value) => formatDateTime(new Date(value).toISOString(), tz)}
                  formatter={(value: number | undefined, name: string | undefined) => [
                    (value ?? 0).toFixed(2),
                    name === 'value' ? 'Metric Value' : 'Threshold',
                  ]}
                />
                <ReferenceLine
                  y={alert.threshold}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="3 3"
                  label="Threshold"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <div>
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

          {paginatedHistory.map((event, index) => {
            const config = eventTypeConfig[event.event_type]
            const Icon = config.icon

            // Calculate duration for triggered->resolved pairs
            let durationMinutes: number | null = null
            if (event.event_type === 'resolved') {
              const triggeredEvent = history.find(
                (e) =>
                  e.event_type === 'triggered' &&
                  parseISO(e.created_at) < parseISO(event.created_at)
              )
              if (triggeredEvent) {
                durationMinutes = differenceInMinutes(
                  parseISO(event.created_at),
                  parseISO(triggeredEvent.created_at)
                )
              }
            }

            return (
              <div
                key={event.id}
                className={cn('relative flex gap-4 py-3 pl-0', index !== paginatedHistory.length - 1 && 'pb-3')}
              >
                {/* Timeline dot with pulsing effect for triggered */}
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-2 ring-border">
                  <Icon className={cn('h-4 w-4', config.iconColor)} />
                  {event.event_type === 'triggered' && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-20" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={cn('font-medium', config.textColor)}>
                      {config.label}
                    </Badge>
                    {event.metric_value != null && (
                      <span className="text-xs text-muted-foreground">
                        Value: <strong className="font-mono">{event.metric_value.toFixed(2)}</strong>
                        {event.threshold_value != null && (
                          <>
                            {' '}
                            / Threshold:{' '}
                            <strong className="font-mono">{event.threshold_value.toFixed(2)}</strong>
                          </>
                        )}
                      </span>
                    )}
                    {durationMinutes != null && (
                      <Badge variant="outline" className="bg-success/10 text-success">
                        <Clock className="mr-1 h-3 w-3" />
                        Resolved in {durationMinutes}m
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{event.message}</p>
                  <p className="text-xs text-muted-foreground" title={formatDateTime(event.created_at, tz)}>
                    {formatRelativeTime(event.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 mt-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, history.length)} of{' '}
              {history.length} events
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
