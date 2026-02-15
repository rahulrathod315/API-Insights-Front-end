import { useMemo } from 'react'
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ResponseTimeChart } from '../components/response-time-chart'
import { ResponseTimeDistribution } from '../components/response-time-distribution'
import { SlowEndpointsTable } from '../components/slow-endpoints-table'
import {
  useTimeSeries,
  useSlowEndpoints,
} from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { formatMs, formatNumber } from '@/lib/utils/format'
import { Gauge, TrendingUp, TrendingDown, Zap } from 'lucide-react'
import type { AnalyticsParams } from '../types'

function normalizeParams(params: AnalyticsParams): AnalyticsParams {
  if (params.start_date && params.end_date) {
    const start = parseISO(params.start_date)
    const end = parseISO(params.end_date)
    if (isValid(start) && isValid(end)) {
      const diff = Math.max(1, differenceInCalendarDays(end, start) + 1)
      return { days: Math.min(diff, 365) }
    }
  }
  return params
}

function getGranularity(days?: number): 'hour' | 'day' | 'week' | 'month' {
  if (!days || days <= 1) return 'hour'
  if (days <= 90) return 'day'
  return 'week'
}

export default function PerformanceAnalyticsPage() {
  const { project } = useProjectContext()
  const { params, setParams } = useAnalyticsParams()
  const normalizedParams = normalizeParams(params)
  const projectId = String(project.id)

  const timeSeriesParams = { ...normalizedParams, granularity: getGranularity(normalizedParams.days) }
  const timeSeries = useTimeSeries(projectId, timeSeriesParams)
  const slowEndpoints = useSlowEndpoints(projectId, normalizedParams)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics"
        description="Latency trends, percentiles, and slowest endpoints"
        actions={<TimeRangePicker value={params} onChange={setParams} />}
      />

      {/* Latency trends with percentiles */}
      <ResponseTimeChart
        data={timeSeries.data?.data ?? []}
        isLoading={timeSeries.isLoading}
        days={normalizedParams.days}
      />

      {/* Response time distribution + Latency summary side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <ResponseTimeDistribution
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
        />
        <LatencySummary data={timeSeries.data?.data ?? []} isLoading={timeSeries.isLoading} />
      </div>

      {/* Slowest endpoints */}
      <SlowEndpointsTable
        data={slowEndpoints.data?.slow_endpoints ?? []}
        isLoading={slowEndpoints.isLoading}
      />
    </div>
  )
}

function LatencySummary({ data, isLoading }: { data: import('../types').TimeSeriesPoint[]; isLoading: boolean }) {
  const stats = useMemo(() => {
    if (data.length === 0) return null
    const avgValues = data.map((p) => p.avg_response_time)
    const p50Values = data.map((p) => p.p50_response_time)
    const p95Values = data.map((p) => p.p95_response_time)
    const p99Values = data.map((p) => p.p99_response_time)
    const totalRequests = data.reduce((s, p) => s + p.request_count, 0)

    const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length
    const max = (arr: number[]) => Math.max(...arr)
    const min = (arr: number[]) => Math.min(...arr)

    return {
      avgLatency: avg(avgValues),
      medianLatency: avg(p50Values),
      p95Latency: avg(p95Values),
      p99Latency: avg(p99Values),
      peakLatency: max(avgValues),
      minLatency: min(avgValues),
      totalRequests,
      dataPoints: data.length,
    }
  }, [data])

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Latency Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Latency Summary</CardTitle></CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const items = [
    { label: 'Avg Latency', value: formatMs(stats.avgLatency), icon: Gauge },
    { label: 'Median (P50)', value: formatMs(stats.medianLatency), icon: Zap },
    { label: 'P95 Latency', value: formatMs(stats.p95Latency), icon: TrendingUp },
    { label: 'P99 Latency', value: formatMs(stats.p99Latency), icon: TrendingUp },
    { label: 'Peak Latency', value: formatMs(stats.peakLatency), icon: TrendingDown },
    { label: 'Total Requests', value: formatNumber(stats.totalRequests), icon: Zap },
  ]

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Latency Summary</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
              <p className="mt-1 text-lg font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
