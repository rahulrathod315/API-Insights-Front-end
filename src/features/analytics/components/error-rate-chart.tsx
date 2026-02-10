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
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber } from '@/lib/utils/format'
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
  if (isLoading) {
    return <ChartSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Error Rate</CardTitle>
      </CardHeader>
      <CardContent>
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
                        {new Date(label as string).toLocaleString()}
                      </p>
                      <p>
                        Errors:{' '}
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
                dataKey="error_count"
                stroke="var(--chart-4)"
                strokeWidth={2}
                fill="url(#errorGradient)"
                dot={false}
                activeDot={{ r: 4, fill: 'var(--chart-4)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export { ErrorRateChart }
export type { ErrorRateChartProps }
