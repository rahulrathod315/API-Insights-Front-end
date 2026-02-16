import { useMemo } from 'react'
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ResponseTimeChart } from '../components/response-time-chart'
import { ResponseTimeDistribution } from '../components/response-time-distribution'
import { ResponseTimeCategories } from '../components/response-time-categories'
import { SlowEndpointsTable } from '../components/slow-endpoints-table'
import { ComparisonSummaryHeader } from '../components/comparison-summary-header'
import { DataFreshnessIndicator } from '../components/data-freshness-indicator'
import {
  useTimeSeries,
  useSlowEndpoints,
  useComparison,
} from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { formatMs, formatNumber, formatDate } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { Gauge, TrendingUp, TrendingDown, Zap, Activity, Timer } from 'lucide-react'
import { subDays } from 'date-fns'
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

export default function PerformanceAnalyticsPage() {
  const { project } = useProjectContext()
  const { params, setParams } = useAnalyticsParams()
  const normalizedParams = normalizeParams(params)
  const projectId = String(project.id)
  const tz = useTimezone()

  const timeSeriesParams = { ...normalizedParams }
  const timeSeries = useTimeSeries(projectId, timeSeriesParams)
  const slowEndpoints = useSlowEndpoints(projectId, normalizedParams)

  // Calculate comparison params
  const comparisonParams = useMemo(() => {
    const days = normalizedParams.days ?? 30
    const currentEnd = new Date()
    const currentStart = subDays(currentEnd, days)
    const previousEnd = subDays(currentStart, 1)
    const previousStart = subDays(previousEnd, days)

    return {
      current_start: currentStart.toISOString().split('T')[0],
      current_end: currentEnd.toISOString().split('T')[0],
      previous_start: previousStart.toISOString().split('T')[0],
      previous_end: previousEnd.toISOString().split('T')[0],
    }
  }, [normalizedParams.days])

  const comparison = useComparison(projectId, comparisonParams)

  const periodLabel = useMemo(() => {
    if (!comparison.data) return undefined
    const { current_period, previous_period } = comparison.data
    return `${formatDate(current_period.start, tz)} - ${formatDate(current_period.end, tz)} vs ${formatDate(previous_period.start, tz)} - ${formatDate(previous_period.end, tz)}`
  }, [comparison.data, tz])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics"
        description="Latency trends, percentiles, and slowest endpoints"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <DataFreshnessIndicator
              isFetching={timeSeries.isFetching || slowEndpoints.isFetching}
              dataUpdatedAt={timeSeries.dataUpdatedAt}
              onRefresh={() => {
                timeSeries.refetch()
                slowEndpoints.refetch()
                comparison.refetch()
              }}
            />
            <TimeRangePicker value={params} onChange={setParams} showGranularity />
          </div>
        }
      />

      {/* Comparison Summary Header */}
      <ComparisonSummaryHeader
        requestCount={
          comparison.data
            ? {
                current: comparison.data.current_period.metrics.request_count,
                previous: comparison.data.previous_period.metrics.request_count,
                change: comparison.data.changes.request_count?.percent,
              }
            : undefined
        }
        errorRate={
          comparison.data
            ? {
                current: comparison.data.current_period.metrics.error_rate,
                previous: comparison.data.previous_period.metrics.error_rate,
                change: comparison.data.changes.error_rate?.percent,
              }
            : undefined
        }
        p95Latency={
          comparison.data
            ? {
                current: comparison.data.current_period.metrics.avg_response_time,
                previous: comparison.data.previous_period.metrics.avg_response_time,
                change: comparison.data.changes.avg_response_time?.percent,
              }
            : undefined
        }
        periodLabel={periodLabel}
        isLoading={comparison.isLoading}
      />

      {/* Latency trends with percentiles */}
      <div id="chart-performance">
        <ResponseTimeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
          days={normalizedParams.days}
        />
      </div>

      {/* Response time distribution + Categories + Latency summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ResponseTimeDistribution
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
        />
        <ResponseTimeCategories
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
    const p90Values = data.map((p) => p.p90_response_time ?? 0)
    const p95Values = data.map((p) => p.p95_response_time)
    const p99Values = data.map((p) => p.p99_response_time)
    const minValues = data.map((p) => p.min_response_time ?? 0)
    const maxValues = data.map((p) => p.max_response_time ?? 0)
    const totalRequests = data.reduce((s, p) => s + p.request_count, 0)

    const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length
    const max = (arr: number[]) => Math.max(...arr)
    const min = (arr: number[]) => Math.min(...arr.filter(v => v > 0))

    return {
      avgLatency: avg(avgValues),
      medianLatency: avg(p50Values),
      p90Latency: avg(p90Values),
      p95Latency: avg(p95Values),
      p99Latency: avg(p99Values),
      peakLatency: max(maxValues.length > 0 ? maxValues : avgValues),
      minLatency: min(minValues.length > 0 && minValues.some(v => v > 0) ? minValues : avgValues),
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
            {Array.from({ length: 8 }).map((_, i) => (
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
    { label: 'P90 Latency', value: formatMs(stats.p90Latency), icon: Activity },
    { label: 'P95 Latency', value: formatMs(stats.p95Latency), icon: TrendingUp },
    { label: 'P99 Latency', value: formatMs(stats.p99Latency), icon: TrendingUp },
    { label: 'Min Latency', value: formatMs(stats.minLatency), icon: Timer },
    { label: 'Peak (Max)', value: formatMs(stats.peakLatency), icon: TrendingDown },
    { label: 'Total Requests', value: formatNumber(stats.totalRequests), icon: Activity },
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
