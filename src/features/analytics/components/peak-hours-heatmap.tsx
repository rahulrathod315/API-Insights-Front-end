import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { TimeSeriesPoint } from '../types'

interface PeakHoursHeatmapProps {
  data: TimeSeriesPoint[]
  isLoading?: boolean
  className?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function PeakHoursHeatmap({ data, isLoading, className }: PeakHoursHeatmapProps) {

  const { grid, maxCount } = useMemo(() => {
    if (!data.length) return { grid: [], maxCount: 0 }

    // Initialize 7x24 grid
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0))
    
    // Aggregate data
    data.forEach(point => {
      const date = new Date(point.timestamp)
      // Adjust for timezone if needed, currently assuming timestamp is UTC or local
      // Ideally use date-fns-tz but native Date with simple logic for now
      const day = date.getDay() // 0-6 (Sun-Sat)
      const hour = date.getHours() // 0-23
      
      grid[day][hour] += point.request_count
    })

    // Find max for scaling
    let max = 0
    grid.forEach(row => row.forEach(val => {
      if (val > max) max = val
    }))

    return { grid, maxCount: max }
  }, [data])

  if (isLoading) {
    return <ChartSkeleton className="h-[400px]" />
  }

  return (
    <Card className={cn("overflow-hidden border-none shadow-md ring-1 ring-border", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Peak Traffic Hours</CardTitle>
        <CardDescription>
          Heatmap of request volume by day and hour
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No data available for heatmap.
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[600px] space-y-1">
              {/* X-Axis Labels (Hours) */}
              <div className="flex pl-10">
                {HOURS.map(h => (
                  <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground">
                    {h % 6 === 0 ? h : ''}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="space-y-1">
                {DAYS.map((day, dayIndex) => (
                  <div key={day} className="flex items-center gap-1">
                    {/* Y-Axis Label (Day) */}
                    <div className="w-10 shrink-0 text-xs font-medium text-muted-foreground">
                      {day}
                    </div>
                    
                    {/* Cells */}
                    {HOURS.map((hour) => {
                      const count = grid[dayIndex][hour]
                      const intensity = maxCount > 0 ? count / maxCount : 0
                      
                      // Calculate opacity/color
                      // Use primary color with opacity
                      const opacity = count === 0 ? 0.05 : 0.2 + (intensity * 0.8)
                      
                      return (
                        <TooltipProvider key={`${day}-${hour}`}>
                          <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "h-8 flex-1 rounded-sm transition-all hover:ring-2 hover:ring-ring hover:z-10",
                                  count === 0 && "hover:bg-muted"
                                )}
                                style={{
                                  backgroundColor: `rgba(var(--primary-rgb), ${opacity})`,
                                  // Fallback if CSS var not RGB
                                  background: count === 0 
                                    ? 'var(--muted)' 
                                    : `color-mix(in srgb, var(--primary) ${Math.round(opacity * 100)}%, transparent)`
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                <p className="font-semibold">{day} @ {hour}:00</p>
                                <p>{formatNumber(count)} requests</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-end gap-2 pt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map(op => (
                    <div 
                      key={op} 
                      className="h-3 w-3 rounded-sm bg-primary" 
                      style={{ opacity: op }}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
