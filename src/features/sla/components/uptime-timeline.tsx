import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { formatPercent, formatMs, formatDateTime } from '@/lib/utils/format'
import { useSLATimeline } from '../hooks'
import { Skeleton } from '@/components/ui/skeleton'
import type { TimelineEntry } from '../types'

interface UptimeTimelineProps {
  projectId: string
  slaId: string
}

function TimelineTooltip({ entry, style }: { entry: TimelineEntry; style: React.CSSProperties }) {
  return (
    <div
      className="pointer-events-none absolute z-50 rounded-md border bg-popover px-3 py-2 text-sm shadow-md"
      style={style}
    >
      <p className="font-medium">{formatDateTime(entry.timestamp)}</p>
      <p>Status: {entry.is_up ? 'Up' : 'Down'}</p>
      <p>Requests: {entry.request_count}</p>
      <p>Error Rate: {formatPercent(entry.error_rate)}</p>
      <p>Avg Response: {formatMs(entry.avg_response_time)}</p>
      {entry.downtime_reason && <p>Reason: {entry.downtime_reason}</p>}
    </div>
  )
}

function UptimeTimeline({ projectId, slaId }: UptimeTimelineProps) {
  const { data, isLoading } = useSLATimeline(projectId, slaId, { days: '7' })
  const [hoveredEntry, setHoveredEntry] = useState<{ entry: TimelineEntry; x: number; y: number } | null>(null)

  const groupedByDay = useMemo(() => {
    if (!data?.timeline) return []

    const groups: Record<string, TimelineEntry[]> = {}
    for (const entry of data.timeline) {
      const date = entry.timestamp.split('T')[0]
      if (!groups[date]) groups[date] = []
      groups[date].push(entry)
    }

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, entries]) => ({
        date,
        entries: entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      }))
  }, [data?.timeline])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Uptime Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Uptime Timeline</CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {data.summary.total_hours.toFixed(1)}h</span>
          <span>Up: {data.summary.up_hours.toFixed(1)}h</span>
          <span>Down: {data.summary.down_hours.toFixed(1)}h</span>
          <span>Uptime: {formatPercent(data.summary.uptime_percent)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-1">
          {groupedByDay.map(({ date, entries }) => (
            <div key={date} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{date}</span>
              <div className="flex flex-1 gap-0.5">
                {entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'h-5 flex-1 rounded-sm transition-opacity hover:opacity-80',
                      entry.is_up
                        ? 'bg-primary'
                        : entry.request_count === 0
                          ? 'bg-muted-foreground/30'
                          : 'bg-destructive'
                    )}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setHoveredEntry({
                        entry,
                        x: rect.left,
                        y: rect.bottom + 4,
                      })
                    }}
                    onMouseLeave={() => setHoveredEntry(null)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span>Up</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-destructive" />
              <span>Down</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-muted-foreground/30" />
              <span>No data</span>
            </div>
          </div>
        </div>

        {hoveredEntry && (
          <TimelineTooltip
            entry={hoveredEntry.entry}
            style={{
              position: 'fixed',
              left: hoveredEntry.x,
              top: hoveredEntry.y,
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}

export { UptimeTimeline }
