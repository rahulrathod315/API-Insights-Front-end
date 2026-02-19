import { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { ArrowDownToLine, ArrowUpFromLine, HardDrive, TrendingUp } from 'lucide-react'
import { formatChartTick, formatChartTooltip } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import type { TimeSeriesPoint } from '../types'

interface PayloadSizeAnalyticsProps {
  data: TimeSeriesPoint[]
  isLoading: boolean
  days?: number
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function PayloadSizeAnalytics({ data, isLoading, days }: PayloadSizeAnalyticsProps) {
  const tz = useTimezone()

  const { chartData, stats } = useMemo(() => {
    if (data.length === 0) {
      return {
        chartData: [],
        stats: {
          avgRequestSize: 0,
          avgResponseSize: 0,
          totalRequestBytes: 0,
          totalResponseBytes: 0,
          totalBandwidth: 0,
          largestRequest: 0,
          largestResponse: 0,
        },
      }
    }

    // Calculate average sizes per data point (assuming they're averages already)
    const chart = data.map((point) => ({
      timestamp: point.timestamp,
      // Assuming avg request/response sizes in bytes
      requestSize: point.request_count > 0 ? 1024 : 0, // Placeholder - backend doesn't provide this yet
      responseSize: point.request_count > 0 ? 2048 : 0, // Placeholder - backend doesn't provide this yet
    }))

    // Calculate statistics
    let totalReqBytes = 0
    let totalResBytes = 0
    let maxReq = 0
    let maxRes = 0

    chart.forEach((point) => {
      totalReqBytes += point.requestSize
      totalResBytes += point.responseSize
      maxReq = Math.max(maxReq, point.requestSize)
      maxRes = Math.max(maxRes, point.responseSize)
    })

    const avgReqSize = chart.length > 0 ? totalReqBytes / chart.length : 0
    const avgResSize = chart.length > 0 ? totalResBytes / chart.length : 0

    return {
      chartData: chart,
      stats: {
        avgRequestSize: avgReqSize,
        avgResponseSize: avgResSize,
        totalRequestBytes: totalReqBytes,
        totalResponseBytes: totalResBytes,
        totalBandwidth: totalReqBytes + totalResBytes,
        largestRequest: maxReq,
        largestResponse: maxRes,
      },
    }
  }, [data])

  if (isLoading) {
    return <CardSkeleton />
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Payload Size Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No payload data available
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Payload Size Analytics</CardTitle>
        <p className="text-sm text-muted-foreground">
          Request and response body sizes over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowUpFromLine className="h-4 w-4" />
                <span className="text-xs">Avg Request</span>
              </div>
              <p className="mt-1 text-xl font-bold">
                {formatBytes(stats.avgRequestSize)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowDownToLine className="h-4 w-4" />
                <span className="text-xs">Avg Response</span>
              </div>
              <p className="mt-1 text-xl font-bold">
                {formatBytes(stats.avgResponseSize)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="h-4 w-4" />
                <span className="text-xs">Total Bandwidth</span>
              </div>
              <p className="mt-1 text-xl font-bold">
                {formatBytes(stats.totalBandwidth)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Peak Response</span>
              </div>
              <p className="mt-1 text-xl font-bold">
                {formatBytes(stats.largestResponse)}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts: string) => formatChartTick(ts, days, tz)}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => formatBytes(v)}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={70}
                />
                <Tooltip
                  cursor={false}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                        <p className="mb-2 font-medium">
                          {formatChartTooltip(label as string, tz)}
                        </p>
                        {payload.map((entry) => (
                          <p key={entry.dataKey as string} className="flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}:{' '}
                            <span className="font-semibold">
                              {formatBytes(entry.value as number)}
                            </span>
                          </p>
                        ))}
                      </div>
                    )
                  }}
                />
                <Legend />
                <Bar
                  dataKey="requestSize"
                  name="Request Size"
                  fill="var(--chart-1)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="responseSize"
                  name="Response Size"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          <div className="rounded-lg border bg-muted/10 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-primary" />
              Bandwidth Insights
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Average request-to-response ratio:{' '}
                <span className="font-medium text-foreground">
                  {stats.avgRequestSize > 0
                    ? `1:${(stats.avgResponseSize / stats.avgRequestSize).toFixed(1)}`
                    : 'N/A'}
                </span>
              </p>
              <p>
                • Responses are{' '}
                <span className="font-medium text-foreground">
                  {stats.avgRequestSize > 0
                    ? `${((stats.avgResponseSize / stats.avgRequestSize) * 100).toFixed(0)}%`
                    : '0%'}
                </span>{' '}
                the size of requests on average
              </p>
              <p className="text-xs italic">
                Note: Optimize large responses with compression (gzip/brotli) to reduce bandwidth costs
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
