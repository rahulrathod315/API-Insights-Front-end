import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { cn } from '@/lib/utils/cn'
import type { TimeSeriesPoint } from '../types'

interface PeakHoursHeatmapProps {
  data: TimeSeriesPoint[]
  isLoading?: boolean
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function PeakHoursHeatmap({ data, isLoading }: PeakHoursHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ day: string; hour: number; count: number; x: number; y: number } | null>(null)

  const { grid, maxCount } = useMemo(() => {
    // 7 days × 24 hours
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))

    for (const point of data) {
      const d = new Date(point.timestamp)
      const dayOfWeek = d.getDay() // 0=Sun
      const hour = d.getHours()
      grid[dayOfWeek][hour] += point.request_count
    }

    let maxCount = 1
    for (const row of grid) {
      for (const val of row) {
        if (val > maxCount) maxCount = val
      }
    }

    return { grid, maxCount }
  }, [data])

  function getOpacity(count: number): number {
    if (count === 0) return 0.05
    return 0.15 + (count / maxCount) * 0.85
  }

  if (isLoading) {
    return <ChartSkeleton />
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Peak Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Peak Hours</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border bg-popover px-3 py-2 text-sm shadow-md"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.day} {tooltip.hour}:00 — {tooltip.count.toLocaleString()} requests
          </div>
        )}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex">
              <div className="w-10 shrink-0" />
              {HOURS.map((h) => (
                <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground">
                  {h}
                </div>
              ))}
            </div>
            {/* Grid rows */}
            {DAYS.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-0">
                <div className="w-10 shrink-0 text-xs text-muted-foreground">{day}</div>
                {HOURS.map((hour) => {
                  const count = grid[dayIdx][hour]
                  return (
                    <div
                      key={hour}
                      className={cn('m-px aspect-square flex-1 rounded-sm')}
                      style={{
                        backgroundColor: `var(--chart-1)`,
                        opacity: getOpacity(count),
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.closest('.relative')?.getBoundingClientRect()
                        const cellRect = e.currentTarget.getBoundingClientRect()
                        if (rect) {
                          setTooltip({
                            day,
                            hour,
                            count,
                            x: cellRect.left - rect.left + cellRect.width / 2,
                            y: cellRect.top - rect.top - 40,
                          })
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}
              </div>
            ))}
            {/* Color legend */}
            <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              {[0.1, 0.3, 0.55, 0.8, 1].map((opacity) => (
                <div
                  key={opacity}
                  className="h-3 w-3 rounded-sm"
                  style={{
                    backgroundColor: `var(--chart-1)`,
                    opacity,
                  }}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
