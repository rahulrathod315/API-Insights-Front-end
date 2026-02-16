import { useMemo } from 'react'
import { differenceInCalendarDays, isValid, parseISO, subDays } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { TopEndpointsTable } from '../components/top-endpoints-table'
import { StatusBreakdown } from '../components/status-breakdown'
import { UserAgentBreakdown } from '../components/user-agent-breakdown'
import { PeakHoursHeatmap } from '../components/peak-hours-heatmap'
import { ComparisonSummaryHeader } from '../components/comparison-summary-header'
import { DataFreshnessIndicator } from '../components/data-freshness-indicator'
import {
  useSummary,
  useTimeSeries,
  useRequestsPerEndpoint,
  useUserAgentBreakdown,
  useComparison,
} from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { formatDate } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
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

export default function TrafficAnalyticsPage() {
  const { project } = useProjectContext()
  const { params, setParams } = useAnalyticsParams()
  const normalizedParams = normalizeParams(params)
  const projectId = String(project.id)
  const tz = useTimezone()

  const summary = useSummary(projectId, normalizedParams)
  const timeSeriesParams = { ...normalizedParams }
  const timeSeries = useTimeSeries(projectId, timeSeriesParams)
  const endpoints = useRequestsPerEndpoint(projectId, normalizedParams)
  const userAgents = useUserAgentBreakdown(projectId, normalizedParams)

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
        title="Traffic Analytics"
        description="Request volume, distribution by method and endpoint"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <DataFreshnessIndicator
              isFetching={summary.isFetching || timeSeries.isFetching}
              dataUpdatedAt={summary.dataUpdatedAt}
              onRefresh={() => {
                summary.refetch()
                timeSeries.refetch()
                endpoints.refetch()
                userAgents.refetch()
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
        periodLabel={periodLabel}
        isLoading={comparison.isLoading}
      />

      {/* Requests over time */}
      <div id="chart-requests">
        <RequestVolumeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
          days={normalizedParams.days}
        />
      </div>

      {/* Status breakdown + User agents */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatusBreakdown
          data={summary.data?.status_breakdown ?? {}}
          isLoading={summary.isLoading}
        />
        <UserAgentBreakdown
          data={userAgents.data?.user_agents ?? []}
          isLoading={userAgents.isLoading}
        />
      </div>

      {/* Peak hours */}
      <PeakHoursHeatmap
        data={timeSeries.data?.data ?? []}
        isLoading={timeSeries.isLoading}
      />

      {/* Requests grouped by endpoint */}
      <TopEndpointsTable
        data={endpoints.data?.endpoints ?? []}
        isLoading={endpoints.isLoading}
      />
    </div>
  )
}
