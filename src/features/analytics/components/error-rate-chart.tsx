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
import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { TimeSeriesPoint } from '../types'

interface ErrorRateChartProps {
  data: TimeSeriesPoint[]
  isLoading: boolean
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ErrorRateChart({ data, isLoading }: ErrorRateChartProps) {
  const chartAnimation = useChartAnimation()
  const [mode, setMode] = useState<'count' | 'rate'>('count')

  if (isLoading) {
    return <ChartSkeleton />
  }

  const metric = mode === 'rate'
    ? { key: 'error_rate', label: 'Error Rate', format: formatPercent }
    : { key: 'error_count', label: 'Errors', format: formatNumber }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">
            Error Rate
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={mode === 'count' ? 'secondary' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setMode('count')}
            >
              Count
            </Button>
            <Button
              type="button"
              variant={mode === 'rate' ? 'secondary' : 'outline'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setMode('rate')}
            >
              Rate %
            </Button>
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
                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-4)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-4)"
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
                  tickFormatter={formatTimestamp}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={metric.format}
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
                          {new Date(label as string).toLocaleString()}
                        </p>
                        <p>
                          {metric.label}:{' '}
                          <span className="font-semibold">
                            {metric.format(payload[0].value as number)}
                          </span>
                        </p>
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metric.key}
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  fill="url(#errorGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--chart-4)' }}
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

export { ErrorRateChart }
export type { ErrorRateChartProps }
