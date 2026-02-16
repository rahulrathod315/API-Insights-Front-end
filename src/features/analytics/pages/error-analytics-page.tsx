import { useMemo } from 'react'
import { differenceInCalendarDays, isValid, parseISO, subDays } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ErrorRateChart } from '../components/error-rate-chart'
import { ErrorClusters } from '../components/error-clusters'
import { ComparisonSummaryHeader } from '../components/comparison-summary-header'
import { DataFreshnessIndicator } from '../components/data-freshness-indicator'
import {
  useTimeSeries,
  useErrorClusters,
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

export default function ErrorAnalyticsPage() {
  const { project } = useProjectContext()
  const { params, setParams } = useAnalyticsParams()
  const normalizedParams = normalizeParams(params)
  const projectId = String(project.id)
  const tz = useTimezone()

  const timeSeriesParams = { ...normalizedParams }
  const timeSeries = useTimeSeries(projectId, timeSeriesParams)
  const errorClusters = useErrorClusters(projectId, normalizedParams)

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
        title="Error Analytics"
        description="Error rate trends and breakdown by endpoint and status code"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <DataFreshnessIndicator
              isFetching={timeSeries.isFetching || errorClusters.isFetching}
              dataUpdatedAt={timeSeries.dataUpdatedAt}
              onRefresh={() => {
                timeSeries.refetch()
                errorClusters.refetch()
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

      {/* Error rate over time */}
      <div id="chart-error-rate">
        <ErrorRateChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
          days={normalizedParams.days}
        />
      </div>

      {/* Error clusters: by status code, by endpoint, common messages */}
      <ErrorClusters
        data={errorClusters.data}
        isLoading={errorClusters.isLoading}
      />
    </div>
  )
}
