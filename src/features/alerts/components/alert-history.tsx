import { cn } from '@/lib/utils/cn'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format'
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Plus,
  Pencil,
  PowerOff,
  Power,
  Info,
} from 'lucide-react'
import type { AlertHistory as AlertHistoryType } from '../types'

interface AlertHistoryProps {
  history: AlertHistoryType[]
  isLoading: boolean
}

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

  return (
    <div className="relative space-y-0">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

      {history.map((event, index) => {
        const config = eventTypeConfig[event.event_type]
        const Icon = config.icon

        return (
          <div
            key={event.id}
            className={cn(
              'relative flex gap-4 py-3 pl-0',
              index !== history.length - 1 && 'pb-3'
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
              <p className="text-xs text-muted-foreground" title={formatDateTime(event.created_at)}>
                {formatRelativeTime(event.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { AlertHistory }
export type { AlertHistoryProps }
