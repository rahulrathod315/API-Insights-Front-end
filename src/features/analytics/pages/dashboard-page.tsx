import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { useProjectContext } from '@/features/projects/project-context'
import { OverviewStats } from '../components/overview-stats'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { ErrorRateChart } from '../components/error-rate-chart'
import { ResponseTimeChart } from '../components/response-time-chart'
import { StatusBreakdown } from '../components/status-breakdown'
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
  useComparison,
} from '../hooks'
import { exportData } from '../api'
import type { AnalyticsParams, ComparisonParams, ExportParams } from '../types'

export default function DashboardPage() {
  const { project } = useProjectContext()
  const [params, setParams] = useState<AnalyticsParams>({ days: 7 })
  const [isExporting, setIsExporting] = useState(false)

  // Comparison params are optional; set to undefined to disable the query
  const [comparisonParams] = useState<ComparisonParams | undefined>(undefined)

  const summary = useSummary(String(project.id), params)
  const timeSeries = useTimeSeries(String(project.id), params)
  const endpoints = useRequestsPerEndpoint(String(project.id), params)
  const slowEndpoints = useSlowEndpoints(String(project.id), params)
  const errorClusters = useErrorClusters(String(project.id), params)
  const comparison = useComparison(String(project.id), comparisonParams)

  async function handleExport() {
    setIsExporting(true)
    try {
      const exportParams: ExportParams = {
        format: 'csv',
        start_date: params.start_date,
        end_date: params.end_date,
      }
      const blob = await exportData(String(project.id), exportParams)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${project.id}-${Date.now()}.csv`
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
        title="Dashboard"
        description="Monitor your API performance and health metrics"
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

      {/* Overview Stats */}
      <OverviewStats
        data={summary.data ?? defaultSummary}
        isLoading={summary.isLoading}
      />

      {/* Request Volume + Error Rate */}
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

      {/* Response Time + Status Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        <ResponseTimeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
        />
        <StatusBreakdown
          data={summary.data?.status_breakdown ?? {}}
          isLoading={summary.isLoading}
        />
      </div>

      {/* Top Endpoints */}
      <TopEndpointsTable
        data={endpoints.data?.endpoints ?? []}
        isLoading={endpoints.isLoading}
      />

      {/* Slow Endpoints + Error Clusters */}
      <div className="grid gap-6 md:grid-cols-2">
        <SlowEndpointsTable
          data={slowEndpoints.data?.slow_endpoints ?? []}
          isLoading={slowEndpoints.isLoading}
        />
        <ErrorClusters
          data={errorClusters.data}
          isLoading={errorClusters.isLoading}
        />
      </div>

      {/* Period Comparison */}
      {comparison.data && (
        <PeriodComparison
          data={comparison.data}
          isLoading={comparison.isLoading}
        />
      )}
    </div>
  )
}
