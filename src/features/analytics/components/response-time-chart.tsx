import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import { formatMs } from '@/lib/utils/format'
import type { TimeSeriesPoint } from '../types'

interface ResponseTimeChartProps {
  data: TimeSeriesPoint[]
  isLoading: boolean
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function ResponseTimeChart({ data, isLoading }: ResponseTimeChartProps) {
  if (isLoading) {
    return <ChartSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Response Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
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
                tickFormatter={(v: number) => formatMs(v)}
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                      <p className="mb-1 font-medium">
                        {new Date(label as string).toLocaleString()}
                      </p>
                      {payload.map((entry) => (
                        <p key={entry.dataKey as string} className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}:{' '}
                          <span className="font-semibold">
                            {formatMs(entry.value as number)}
                          </span>
                        </p>
                      ))}
                    </div>
                  )
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="avg_response_time"
                name="Avg"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="p95_response_time"
                name="P95"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="p99_response_time"
                name="P99"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="2 2"
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export { ResponseTimeChart }
export type { ResponseTimeChartProps }
