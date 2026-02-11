import { useState } from 'react'
import { Download } from 'lucide-react'
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { useProjectContext } from '@/features/projects/project-context'
import { OverviewStats } from '../components/overview-stats'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { ErrorRateChart } from '../components/error-rate-chart'
import { ResponseTimeChart } from '../components/response-time-chart'
import { StatusBreakdown } from '../components/status-breakdown'
import { UserAgentBreakdown } from '../components/user-agent-breakdown'
import { TopEndpointsTable } from '../components/top-endpoints-table'
import { SlowEndpointsTable } from '../components/slow-endpoints-table'
import { ErrorClusters } from '../components/error-clusters'
import { PeriodComparison } from '../components/period-comparison'
import { TimeRangePicker } from '../components/time-range-picker'
import {
  useSummary,
  useTimeSeries,
  useRequestsPerEndpoint,
  useSlowEndpoints,
  useErrorClusters,
  useUserAgentBreakdown,
  useComparison,
} from '../hooks'
import { exportData } from '../api'
import type { AnalyticsParams, ComparisonParams, ExportParams } from '../types'

function normalizeAnalyticsParams(params: AnalyticsParams): AnalyticsParams {
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

export default function AnalyticsPage() {
  const { project } = useProjectContext()
  const [params, setParams] = useState<AnalyticsParams>({ days: 7 })
  const [isExporting, setIsExporting] = useState(false)

  const normalizedParams = normalizeAnalyticsParams(params)

  // Comparison params are optional; set to undefined to disable the query
  const [comparisonParams] = useState<ComparisonParams | undefined>(undefined)

  const summary = useSummary(String(project.id), normalizedParams)
  const timeSeries = useTimeSeries(String(project.id), normalizedParams)
  const endpoints = useRequestsPerEndpoint(String(project.id), normalizedParams)
  const slowEndpoints = useSlowEndpoints(String(project.id), normalizedParams)
  const errorClusters = useErrorClusters(String(project.id), normalizedParams)
  const userAgents = useUserAgentBreakdown(String(project.id), normalizedParams)
  const comparison = useComparison(String(project.id), comparisonParams)

  function getFilenameFromDisposition(disposition?: string) {
    if (!disposition) return null
    const match = /filename="?([^"]+)"?/.exec(disposition)
    return match?.[1] ?? null
  }

  async function handleExport() {
    setIsExporting(true)
    try {
      const exportParams: ExportParams = {
        format: 'csv',
        start_date: params.start_date,
        end_date: params.end_date,
      }
      const response = await exportData(String(project.id), exportParams)
      const blob = response.data
      const filename =
        getFilenameFromDisposition(response.headers?.['content-disposition']) ??
        `analytics-${project.id}-${Date.now()}.csv`
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const defaultSummary = {
    project: { id: 0, name: '' },
    period: { days: 7, start_date: '', end_date: '' },
    summary: {
      total_requests: 0,
      successful_requests: 0,
      error_requests: 0,
      success_rate: 0,
      avg_response_time_ms: 0,
    },
    status_breakdown: {},
    top_endpoints: [],
    daily_trend: [],
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep dive into endpoint behavior, latency, and error patterns"
        actions={
          <div className="flex items-center gap-3">
            <TimeRangePicker value={params} onChange={setParams} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        }
      />

      <OverviewStats
        data={summary.data ?? defaultSummary}
        isLoading={summary.isLoading}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <RequestVolumeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
        />
        <ErrorRateChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ResponseTimeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
        />
        <StatusBreakdown
          data={summary.data?.status_breakdown ?? {}}
          isLoading={summary.isLoading}
        />
        <UserAgentBreakdown
          data={userAgents.data?.user_agents ?? []}
          isLoading={userAgents.isLoading}
        />
      </div>

      <TopEndpointsTable
        data={endpoints.data?.endpoints ?? []}
        isLoading={endpoints.isLoading}
      />

      <SlowEndpointsTable
        data={slowEndpoints.data?.slow_endpoints ?? []}
        isLoading={slowEndpoints.isLoading}
      />

      <ErrorClusters
        data={errorClusters.data}
        isLoading={errorClusters.isLoading}
      />

      {comparison.data && (
        <PeriodComparison
          data={comparison.data}
          isLoading={comparison.isLoading}
        />
      )}
    </div>
  )
}
