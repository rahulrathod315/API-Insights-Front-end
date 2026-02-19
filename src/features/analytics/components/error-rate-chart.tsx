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
import { formatNumber, formatPercent, formatChartTick, formatChartTooltip } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { cn } from '@/lib/utils/cn'
import type { TimeSeriesPoint } from '../types'

interface ErrorRateChartProps {
  data: TimeSeriesPoint[]
  isLoading: boolean
  days?: number
  className?: string
}

function ErrorRateChart({ data, isLoading, days, className }: ErrorRateChartProps) {
  const tz = useTimezone()
  const [mode, setMode] = useState<'count' | 'rate'>('rate')

  if (isLoading) {
    return <ChartSkeleton className="h-[350px]" />
  }

  const metric = mode === 'rate'
    ? { key: 'error_rate', label: 'Error Rate', format: (v: number) => `${formatPercent(v)}%`, desc: 'Percentage of failed requests' }
    : { key: 'error_count', label: 'Error Count', format: formatNumber, desc: 'Total number of failed requests' }

  return (
    <Card className={cn("overflow-hidden border-none shadow-md ring-1 ring-border", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            Error Trends
          </CardTitle>
          <CardDescription>
            {metric.desc} over time
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs font-medium transition-all",
              mode === 'rate'
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setMode('rate')}
          >
            Rate %
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-7 px-3 text-xs font-medium transition-all",
              mode === 'count'
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setMode('count')}
          >
            Count
          </Button>
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
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--destructive)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--destructive)"
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
                  tickFormatter={(ts: string) => formatChartTick(ts, days, tz)}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  minTickGap={30}
                />
                <YAxis
                  tickFormatter={metric.format}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={40}
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
                          <div className="h-2 w-2 rounded-full bg-destructive" />
                          <p className="text-sm font-bold text-foreground">
                            {metric.format(payload[0].value as number)} <span className="text-muted-foreground font-normal text-xs ml-1">{metric.label}</span>
                          </p>
                        </div>
                      </div>
                    )
                  }}
                  cursor={{ stroke: "var(--destructive)", strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey={mode === 'rate' ? 'error_rate' : 'error_count'}
                  stroke="var(--destructive)"
                  strokeWidth={2}
                  fill="url(#errorGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--destructive)", strokeWidth: 2, stroke: "var(--background)" }}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ErrorRateChart }
export type { ErrorRateChartProps }
