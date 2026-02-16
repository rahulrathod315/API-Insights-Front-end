import { useMemo, useState } from 'react'
import {
  CartesianGrid,
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
import { useChartAnimation } from '@/lib/animation'
import { formatMs, formatTimestamp, formatFullDateTime } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import type { TimeSeriesPoint } from '../types'

interface ResponseTimeChartProps {
  data: TimeSeriesPoint[]
  isLoading: boolean
  days?: number
}

const series = [
  { key: 'avg_response_time', label: 'Avg', color: 'var(--chart-1)', dash: undefined, defaultVisible: true },
  { key: 'p50_response_time', label: 'P50', color: 'var(--chart-2)', dash: undefined, defaultVisible: true },
  { key: 'p90_response_time', label: 'P90', color: 'hsl(var(--chart-5))', dash: '3 3', defaultVisible: false },
  { key: 'p95_response_time', label: 'P95', color: 'var(--chart-3)', dash: '5 5', defaultVisible: true },
  { key: 'p99_response_time', label: 'P99', color: 'var(--chart-4)', dash: '2 2', defaultVisible: false },
  { key: 'min_response_time', label: 'Min', color: 'hsl(var(--success))', dash: '1 3', defaultVisible: false },
  { key: 'max_response_time', label: 'Max', color: 'hsl(var(--destructive))', dash: '1 3', defaultVisible: false },
] as const

function ResponseTimeChart({ data, isLoading, days }: ResponseTimeChartProps) {
  const chartAnimation = useChartAnimation()
  const tz = useTimezone()
  const [hiddenKeys, setHiddenKeys] = useState<string[]>(() =>
    series.filter(s => !s.defaultVisible).map(s => s.key)
  )

  const visibleSeries = useMemo(
    () => series.filter((item) => !hiddenKeys.includes(item.key)),
    [hiddenKeys]
  )

  function toggleSeries(key: string) {
    setHiddenKeys((prev) => {
      const next = prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key]
      return next.length === series.length ? [] : next
    })
  }

  if (isLoading) {
    return <ChartSkeleton />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">
            Response Time Trends
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {series.map((item) => {
              const isHidden = hiddenKeys.includes(item.key)
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleSeries(item.key)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all ${
                    isHidden
                      ? 'border-border bg-background opacity-40 hover:opacity-60'
                      : 'border-transparent bg-muted hover:bg-muted/80'
                  }`}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
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
                  tickFormatter={(ts: string) => formatTimestamp(ts, days, tz)}
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
                          {formatFullDateTime(label as string, tz)}
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
                {visibleSeries.map((item) => (
                  <Line
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    name={item.label}
                    stroke={item.color}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray={item.dash}
                    activeDot={{ r: 4 }}
                    {...chartAnimation}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { ResponseTimeChart }
export type { ResponseTimeChartProps }
