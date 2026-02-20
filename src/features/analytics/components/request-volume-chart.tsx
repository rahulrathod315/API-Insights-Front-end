import { useState, useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatChartTick, formatChartTooltip } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { cn } from '@/lib/utils/cn'
import type { TimeSeriesPoint } from '../types'

interface RequestVolumeChartProps {
  data: TimeSeriesPoint[]
  isLoading: boolean
  days?: number
  granularity?: 'hour' | 'day' | 'week' | 'month'
  className?: string
}

const metrics = [
  { key: 'request_count', label: 'Total', color: 'var(--primary)', desc: 'All incoming requests' },
  { key: 'success_count', label: 'Success', color: 'var(--success)', desc: '2xx responses' },
  { key: 'error_count', label: 'Errors', color: 'var(--destructive)', desc: '4xx & 5xx responses' },
] as const

export function RequestVolumeChart({ data, isLoading, days, granularity, className }: RequestVolumeChartProps) {
  const tz = useTimezone()
  const [metricKey, setMetricKey] = useState<(typeof metrics)[number]['key']>(
    'request_count'
  )

  const activeMetric = useMemo(() => 
    metrics.find((metric) => metric.key === metricKey) ?? metrics[0],
    [metricKey]
  )

  // Force re-render of chart when data or metric changes to ensure curve updates
  const chartKey = useMemo(() => {
    if (!data || !data.length) return 'empty'
    return `${metricKey}-${data.length}-${data[0].timestamp}-${data[data.length - 1].timestamp}`
  }, [data, metricKey])

  // Calculate global max for the current dataset across all metrics to fix Y-axis scale.
  const yAxisMax = useMemo(() => {
    if (!data || data.length === 0) return 0
    return Math.max(...data.map(d => d.request_count))
  }, [data])
  
  const gradientId = `volume-gradient-${activeMetric.key}`

  if (isLoading) {
    return <ChartSkeleton className="h-[350px]" />
  }

  return (
    <Card className={cn("overflow-hidden border-none shadow-md ring-1 ring-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            Request Volume
          </CardTitle>
          <CardDescription>
            {activeMetric.desc} over time
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          {metrics.map((metric) => {
            const isActive = metric.key === metricKey
            return (
              <Button
                key={metric.key}
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-3 text-xs font-medium transition-all",
                  isActive 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMetricKey(metric.key)}
              >
                <span 
                  className="mr-1.5 h-2 w-2 rounded-full" 
                  style={{ backgroundColor: metric.color }}
                />
                {metric.label}
              </Button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {(!data || data.length === 0) ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No data available for this range.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                key={chartKey}
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={activeMetric.color}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={activeMetric.color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts: string) => formatChartTick(ts, days, tz, granularity)}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  minTickGap={30}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  domain={[0, yAxisMax > 0 ? yAxisMax * 1.1 : 'auto']}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="rounded-lg border bg-popover p-3 shadow-lg ring-1 ring-border animate-in fade-in-0 zoom-in-95">
                        <p className="mb-2 text-sm font-medium text-popover-foreground">
                          {formatChartTooltip(label as string, tz)}
                        </p>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-2 w-2 rounded-full" 
                            style={{ backgroundColor: activeMetric.color }} 
                          />
                          <p className="text-sm font-bold text-foreground">
                            {formatNumber(payload[0].value as number)} <span className="text-muted-foreground font-normal text-xs ml-1">{activeMetric.label}</span>
                          </p>
                        </div>
                      </div>
                    )
                  }}
                  cursor={{ stroke: activeMetric.color, strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric.key}
                  stroke={activeMetric.color}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 4, fill: activeMetric.color, strokeWidth: 2, stroke: "var(--background)" }}
                  animationDuration={400}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
