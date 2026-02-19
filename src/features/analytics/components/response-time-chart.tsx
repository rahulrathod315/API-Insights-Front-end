import { useState } from 'react'
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
import { formatMs, formatChartTick, formatChartTooltip } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { cn } from '@/lib/utils/cn'
import type { TimeSeriesPoint } from '../types'

interface ResponseTimeChartProps {
  data: TimeSeriesPoint[]
  isLoading: boolean
  days?: number
  className?: string
}

const series = [
  { key: 'p95', dataKey: 'p95_response_time', label: 'P95', color: 'var(--chart-1)', gradientId: 'rtGrad1', desc: '95% of requests are faster than this' },
  { key: 'p99', dataKey: 'p99_response_time', label: 'P99', color: 'var(--chart-2)', gradientId: 'rtGrad2', desc: '99% of requests are faster than this' },
  { key: 'avg', dataKey: 'avg_response_time', label: 'Avg', color: 'var(--chart-3)', gradientId: 'rtGrad3', desc: 'Average response time' },
  { key: 'p50', dataKey: 'p50_response_time', label: 'Median', color: 'var(--chart-4)', gradientId: 'rtGrad4', desc: 'Median response time' },
] as const

function ResponseTimeChart({ data, isLoading, days, className }: ResponseTimeChartProps) {
  const tz = useTimezone()
  const [visibleKeys, setVisibleKeys] = useState<string[]>(['p95', 'avg'])

  const toggleSeries = (key: string) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  if (isLoading) {
    return <ChartSkeleton className="h-[350px]" />
  }

  return (
    <Card className={cn('overflow-hidden border-none shadow-md ring-1 ring-border', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Latency Trends</CardTitle>
          <CardDescription>Response time percentiles</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {series.map((item) => {
            const isVisible = visibleKeys.includes(item.key)
            return (
              <Button
                key={item.key}
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'h-6 border px-2 text-[10px] font-medium transition-all',
                  isVisible
                    ? 'border-transparent bg-muted text-foreground'
                    : 'border-border bg-transparent text-muted-foreground hover:text-foreground'
                )}
                onClick={() => toggleSeries(item.key)}
              >
                <span
                  className="mr-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: isVisible ? item.color : 'var(--muted-foreground)' }}
                />
                {item.label}
              </Button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No data available for this range.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {series.map((item) => (
                    <linearGradient key={item.gradientId} id={item.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={item.color} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={item.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts: string) => formatChartTick(ts, days, tz)}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  minTickGap={30}
                />
                <YAxis
                  tickFormatter={(v: number) => `${v}ms`}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="animate-in fade-in-0 zoom-in-95 rounded-lg border bg-popover p-3 shadow-lg ring-1 ring-border">
                        <p className="mb-2 text-sm font-medium text-popover-foreground">
                          {formatChartTooltip(label as string, tz)}
                        </p>
                        <div className="space-y-1">
                          {payload.map((entry) => (
                            <div key={entry.name} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                {formatMs(entry.value as number)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }}
                  cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                {series.map(
                  (item) =>
                    visibleKeys.includes(item.key) && (
                      <Area
                        key={item.key}
                        type="monotone"
                        dataKey={item.dataKey}
                        name={item.label}
                        stroke={item.color}
                        strokeWidth={2}
                        fill={`url(#${item.gradientId})`}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                        isAnimationActive={false}
                      />
                    )
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ResponseTimeChart }
export type { ResponseTimeChartProps }
