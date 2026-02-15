import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
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
} from 'lucide-react'
import type { AlertHistory as AlertHistoryType } from '../types'

interface AlertHistoryProps {
  history: AlertHistoryType[]
  isLoading: boolean
}

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

const eventTypeConfig: Record<
  AlertHistoryType['event_type'],
  { icon: typeof Info; label: string; textColor: string; iconColor: string }
> = {
  triggered: {
    icon: AlertTriangle,
    label: 'Triggered',
    textColor: 'text-destructive',
    iconColor: 'text-destructive',
  },
  resolved: {
    icon: CheckCircle2,
    label: 'Resolved',
    textColor: 'text-success',
    iconColor: 'text-success',
  },
  acknowledged: {
    icon: Eye,
    label: 'Acknowledged',
    textColor: 'text-primary',
    iconColor: 'text-primary',
  },
  created: {
    icon: Plus,
    label: 'Created',
    textColor: 'text-muted-foreground',
    iconColor: 'text-muted-foreground',
  },
  updated: {
    icon: Pencil,
    label: 'Updated',
    textColor: 'text-muted-foreground',
    iconColor: 'text-muted-foreground',
  },
  disabled: {
    icon: PowerOff,
    label: 'Disabled',
    textColor: 'text-warning',
    iconColor: 'text-warning',
  },
  enabled: {
    icon: Power,
    label: 'Enabled',
    textColor: 'text-success',
    iconColor: 'text-success',
  },
}

function AlertHistory({ history, isLoading }: AlertHistoryProps) {
  const tz = useTimezone()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  if (isLoading) {
    return (
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
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <p className="text-sm text-muted-foreground">No history events yet.</p>
      </div>
    )
  }

  const totalPages = Math.ceil(history.length / pageSize)
  const paginatedHistory = history.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  return (
    <div>
      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        {paginatedHistory.map((event, index) => {
          const config = eventTypeConfig[event.event_type]
          const Icon = config.icon

          return (
            <div
              key={event.id}
              className={cn(
                'relative flex gap-4 py-3 pl-0',
                index !== paginatedHistory.length - 1 && 'pb-3'
              )}
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-2 ring-border',
                )}
              >
                <Icon className={cn('h-4 w-4', config.iconColor)} />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-medium', config.textColor)}>
                    {config.label}
                  </span>
                  {event.metric_value != null && (
                    <span className="text-xs text-muted-foreground">
                      Value: {event.metric_value}
                      {event.threshold_value != null && ` (threshold: ${event.threshold_value})`}
                    </span>
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 mt-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, history.length)} of{' '}
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
  )
}

export { AlertHistory }
export type { AlertHistoryProps }
