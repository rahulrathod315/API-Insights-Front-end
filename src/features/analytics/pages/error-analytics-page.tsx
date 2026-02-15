import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ErrorRateChart } from '../components/error-rate-chart'
import { ErrorClusters } from '../components/error-clusters'
import {
  useTimeSeries,
  useErrorClusters,
} from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
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

export default function ErrorAnalyticsPage() {
  const { project } = useProjectContext()
  const { params, setParams } = useAnalyticsParams()
  const normalizedParams = normalizeParams(params)
  const projectId = String(project.id)

  const timeSeriesParams = { ...normalizedParams, granularity: getGranularity(normalizedParams.days) }
  const timeSeries = useTimeSeries(projectId, timeSeriesParams)
  const errorClusters = useErrorClusters(projectId, normalizedParams)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Error Analytics"
        description="Error rate trends and breakdown by endpoint and status code"
        actions={<TimeRangePicker value={params} onChange={setParams} />}
      />

      {/* Error rate over time */}
      <ErrorRateChart
        data={timeSeries.data?.data ?? []}
        isLoading={timeSeries.isLoading}
        days={normalizedParams.days}
      />

      {/* Error clusters: by status code, by endpoint, common messages */}
      <ErrorClusters
        data={errorClusters.data}
        isLoading={errorClusters.isLoading}
      />
    </div>
  )
}
