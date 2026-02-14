import { useState } from 'react'
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { TopEndpointsTable } from '../components/top-endpoints-table'
import { StatusBreakdown } from '../components/status-breakdown'
import { UserAgentBreakdown } from '../components/user-agent-breakdown'
import { PeakHoursHeatmap } from '../components/peak-hours-heatmap'
import {
  useSummary,
  useTimeSeries,
  useRequestsPerEndpoint,
  useUserAgentBreakdown,
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

export default function TrafficAnalyticsPage() {
  const { project } = useProjectContext()
  const [params, setParams] = useState<AnalyticsParams>({ days: 7 })
  const normalizedParams = normalizeParams(params)
  const projectId = String(project.id)

  const summary = useSummary(projectId, normalizedParams)
  const timeSeriesParams = { ...normalizedParams, granularity: getGranularity(normalizedParams.days) }
  const timeSeries = useTimeSeries(projectId, timeSeriesParams)
  const endpoints = useRequestsPerEndpoint(projectId, normalizedParams)
  const userAgents = useUserAgentBreakdown(projectId, normalizedParams)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic Analytics"
        description="Request volume, distribution by method and endpoint"
        actions={<TimeRangePicker value={params} onChange={setParams} />}
      />

      {/* Requests over time */}
      <RequestVolumeChart
        data={timeSeries.data?.data ?? []}
        isLoading={timeSeries.isLoading}
        days={normalizedParams.days}
      />

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
