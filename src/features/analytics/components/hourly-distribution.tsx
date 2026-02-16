import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatMs } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { Clock, TrendingUp } from 'lucide-react'

interface HourlyData {
  hour: string
  count: number
  avg_response_time: number
}

interface HourlyDistributionProps {
  data: HourlyData[]
  isLoading: boolean
  title?: string
  showResponseTime?: boolean
}

function getIntensityColor(value: number, max: number): string {
  const intensity = max > 0 ? (value / max) * 100 : 0

  if (intensity === 0) return 'bg-muted/30'
  if (intensity < 20) return 'bg-primary/20'
  if (intensity < 40) return 'bg-primary/40'
  if (intensity < 60) return 'bg-primary/60'
  if (intensity < 80) return 'bg-primary/80'
  return 'bg-primary'
}

function getResponseTimeColor(avgTime: number): string {
  if (avgTime < 100) return 'text-success'
  if (avgTime < 500) return 'text-primary'
  if (avgTime < 1000) return 'text-warning'
  return 'text-destructive'
}

export function HourlyDistribution({
  data,
  isLoading,
  title = '24-Hour Traffic Pattern',
  showResponseTime = true,
}: HourlyDistributionProps) {
  const { processedData, maxCount, peakHour, totalRequests } = useMemo(() => {
    if (data.length === 0) {
      return { processedData: [], maxCount: 0, peakHour: null, totalRequests: 0 }
    }

    // Ensure we have all 24 hours
    const hourlyMap = new Map<number, HourlyData>()

    data.forEach(item => {
      const hour = parseInt(item.hour.split(':')[0], 10)
      hourlyMap.set(hour, item)
    })

    // Fill missing hours with zero data
    const fullData: HourlyData[] = []
    for (let i = 0; i < 24; i++) {
      fullData.push(
        hourlyMap.get(i) || {
          hour: `${i.toString().padStart(2, '0')}:00`,
          count: 0,
          avg_response_time: 0,
        }
      )
    }

    const maxCount = Math.max(...fullData.map(d => d.count))
    const peakHour = fullData.reduce((max, curr) =>
      curr.count > max.count ? curr : max
    )
    const totalRequests = fullData.reduce((sum, curr) => sum + curr.count, 0)

    return { processedData: fullData, maxCount, peakHour, totalRequests }
  }, [data])

  if (isLoading) {
    return <CardSkeleton />
  }

  if (processedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No hourly data available
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Request distribution across 24 hours (UTC)
            </p>
          </div>
          {peakHour && (
            <div className="rounded-lg border bg-muted/50 px-3 py-2 text-right">
              <p className="text-xs text-muted-foreground">Peak Hour</p>
              <p className="text-lg font-bold">{peakHour.hour}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(peakHour.count)} requests
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="grid grid-cols-12 gap-1">
            {processedData.map((hourData, idx) => {
              const hour = idx
              const intensityColor = getIntensityColor(hourData.count, maxCount)
              const percentage = maxCount > 0 ? ((hourData.count / maxCount) * 100).toFixed(0) : '0'

              return (
                <TooltipProvider key={hour}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'relative aspect-square rounded transition-all duration-200 hover:scale-110 hover:ring-2 hover:ring-primary hover:ring-offset-1',
                          intensityColor,
                          hourData.count === 0 && 'opacity-50'
                        )}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-medium">
                            {hour}
                          </span>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="flex items-center gap-1 font-medium">
                          <Clock className="h-3 w-3" />
                          {hourData.hour}
                        </p>
                        <p className="text-xs">
                          Requests: <span className="font-semibold">{formatNumber(hourData.count)}</span>
                        </p>
                        <p className="text-xs">
                          Intensity: <span className="font-semibold">{percentage}%</span>
                        </p>
                        {showResponseTime && hourData.avg_response_time > 0 && (
                          <p className="text-xs">
                            Avg Response:{' '}
                            <span className={cn('font-semibold', getResponseTimeColor(hourData.avg_response_time))}>
                              {formatMs(hourData.avg_response_time)}
                            </span>
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-muted/30" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary/40" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-primary" />
                <span>High</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Total: <span className="font-semibold text-foreground">{formatNumber(totalRequests)}</span> requests
            </div>
          </div>

          {/* Top 5 Hours by Traffic */}
          {showResponseTime && (
            <div className="border-t pt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Top 5 Hours by Traffic</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {processedData
                  .filter(h => h.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((hourData) => (
                    <div
                      key={hourData.hour}
                      className="rounded-md border bg-muted/30 px-3 py-2"
                    >
                      <p className="text-sm font-semibold">{hourData.hour}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(hourData.count)} requests
                      </p>
                      {hourData.avg_response_time > 0 && (
                        <p className={cn('text-xs font-medium', getResponseTimeColor(hourData.avg_response_time))}>
                          {formatMs(hourData.avg_response_time)}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
