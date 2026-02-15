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
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { useChartAnimation } from '@/lib/animation'
import { formatNumber, formatTimestamp, formatFullDateTime } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import type { TimeSeriesPoint } from '../types'

interface RequestVolumeChartProps {
  data: TimeSeriesPoint[]
  isLoading: boolean
  days?: number
}

const metrics = [
  { key: 'request_count', label: 'Total', color: 'var(--chart-1)' },
  { key: 'success_count', label: 'Success', color: 'var(--chart-1)' },
  { key: 'error_count', label: 'Errors', color: 'var(--chart-1)' },
] as const

function RequestVolumeChart({ data, isLoading, days }: RequestVolumeChartProps) {
  const chartAnimation = useChartAnimation()
  const tz = useTimezone()
  const [metricKey, setMetricKey] = useState<(typeof metrics)[number]['key']>(
    'request_count'
  )

  if (isLoading) {
    return <ChartSkeleton />
  }

  const activeMetric =
    metrics.find((metric) => metric.key === metricKey) ?? metrics[0]
  const gradientId = 'volume-gradient'

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">
            Request Volume
          </CardTitle>
          <div className="flex items-center gap-2">
            {metrics.map((metric) => (
              <Button
                key={metric.key}
                type="button"
                variant={metric.key === metricKey ? 'outline' : 'outline'}
                size="sm"
                className={`h-7 px-2 text-xs ${metric.key === metricKey ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:text-primary' : ''}`}
                onClick={() => setMetricKey(metric.key)}
              >
                {metric.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No data available for this range.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={activeMetric.color}
                      stopOpacity={0.25}
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
                  className="stroke-border"
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts: string) => formatTimestamp(ts, days, tz)}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={50}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                        <p className="mb-1 font-medium">
                          {formatFullDateTime(label as string, tz)}
                        </p>
                        <p>
                          {activeMetric.label}:{' '}
                          <span className="font-semibold">
                            {formatNumber(payload[0].value as number)}
                          </span>
                        </p>
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetric.key}
                  stroke={activeMetric.color}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  dot={false}
                  activeDot={{ r: 4, fill: activeMetric.color }}
                  {...chartAnimation}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { RequestVolumeChart }
export type { RequestVolumeChartProps }
