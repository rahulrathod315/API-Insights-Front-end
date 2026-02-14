import { useState } from 'react'
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ResponseTimeChart } from '../components/response-time-chart'
import { ResponseTimeDistribution } from '../components/response-time-distribution'
import { SlowEndpointsTable } from '../components/slow-endpoints-table'
import {
  useTimeSeries,
  useSlowEndpoints,
} from '../hooks'
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
  const [params, setParams] = useState<AnalyticsParams>({ days: 7 })
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

      {/* Response time distribution */}
      <ResponseTimeDistribution
        data={timeSeries.data?.data ?? []}
        isLoading={timeSeries.isLoading}
      />

      {/* Slowest endpoints */}
      <SlowEndpointsTable
        data={slowEndpoints.data?.slow_endpoints ?? []}
        isLoading={slowEndpoints.isLoading}
      />
    </div>
  )
}
