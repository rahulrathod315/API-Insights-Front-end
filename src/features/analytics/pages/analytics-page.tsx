import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { differenceInCalendarDays, isValid, parseISO, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { StaggerGroup, StaggerItem } from '@/components/animation'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ExportDialog } from '../components/export-dialog'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { ErrorRateChart } from '../components/error-rate-chart'
import { ResponseTimeChart } from '../components/response-time-chart'
import { StatusBreakdown } from '../components/status-breakdown'
import { TopEndpointsTable } from '../components/top-endpoints-table'
import { ComparisonSummaryHeader } from '../components/comparison-summary-header'
import { DataFreshnessIndicator } from '../components/data-freshness-indicator'
import { ResponseTimeCategories } from '../components/response-time-categories'
import { ResponseTimeDistribution } from '../components/response-time-distribution'
import { SlowEndpointsTable } from '../components/slow-endpoints-table'
import { UserAgentBreakdown } from '../components/user-agent-breakdown'
import { ErrorClusters } from '../components/error-clusters'
import { GeoWorldMap } from '../components/geo-world-map'
import { GeoPerformance } from '../components/geo-performance'
import { GeoISPTable } from '../components/geo-isp-table'
import { PayloadSizeAnalytics } from '../components/payload-size-analytics'
import { EndpointSizeBreakdown } from '../components/endpoint-size-breakdown'
import {
  useSummary,
  useTimeSeries,
  useComparison,
  useRequestsPerEndpoint,
  useSlowEndpoints,
  useUserAgentBreakdown,
  useErrorClusters,
  useGeoOverview,
  useGeoPerformance,
  useGeoISPs,
} from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { exportData } from '../api'
import { formatNumber, formatMs, formatPercent, formatDate } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import type { AnalyticsParams, ExportParams } from '../types'
import { Activity, AlertTriangle, Clock, CheckCircle, Zap, Timer } from 'lucide-react'

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
  const { params, setParams } = useAnalyticsParams()
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const tz = useTimezone()

  const normalizedParams = normalizeAnalyticsParams(params)
  const projectId = String(project.id)

  // Fetch all data
  const summary = useSummary(projectId, normalizedParams)
  const timeSeriesParams = { ...normalizedParams }
  const timeSeries = useTimeSeries(projectId, timeSeriesParams)
  const endpoints = useRequestsPerEndpoint(projectId, normalizedParams)
  const slowEndpoints = useSlowEndpoints(projectId, normalizedParams)
  const userAgents = useUserAgentBreakdown(projectId, normalizedParams)
  const errorClusters = useErrorClusters(projectId, normalizedParams)
  const geoOverview = useGeoOverview(projectId, normalizedParams)
  const geoPerformance = useGeoPerformance(projectId, normalizedParams)
  const geoISPs = useGeoISPs(projectId, normalizedParams)

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

  function getFilenameFromDisposition(disposition?: string) {
    if (!disposition) return null
    const match = /filename="?([^"]+)"?/.exec(disposition)
    return match?.[1] ?? null
  }

  async function handleExport(exportOpts: { format: 'csv' | 'json'; start_date: string; end_date: string; limit?: number }) {
    const exportParams: ExportParams = {
      export_format: exportOpts.format,
      start_date: exportOpts.start_date,
      end_date: exportOpts.end_date,
      limit: exportOpts.limit,
    }
    const response = await exportData(projectId, exportParams)
    const blob = response.data
    const ext = exportOpts.format
    const filename =
      getFilenameFromDisposition(response.headers?.['content-disposition']) ??
      `analytics-${project.id}-${Date.now()}.${ext}`
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleRefreshAll = () => {
    summary.refetch()
    timeSeries.refetch()
    endpoints.refetch()
    slowEndpoints.refetch()
    userAgents.refetch()
    errorClusters.refetch()
    geoOverview.refetch()
    geoPerformance.refetch()
    geoISPs.refetch()
    comparison.refetch()
  }

  const s = summary.data?.summary
  const isLoading = summary.isLoading

  // Calculate aggregate stats with safety checks
  const timeSeriesData = timeSeries.data?.data ?? []
  const p50 = timeSeriesData.length > 0
    ? timeSeriesData.reduce((sum, point) => sum + (point.p50_response_time ?? 0), 0) / timeSeriesData.length
    : 0
  const p90 = timeSeriesData.length > 0
    ? timeSeriesData.reduce((sum, point) => sum + (point.p90_response_time ?? 0), 0) / timeSeriesData.length
    : 0
  const p95 = timeSeriesData.length > 0
    ? timeSeriesData.reduce((sum, point) => sum + (point.p95_response_time ?? 0), 0) / timeSeriesData.length
    : 0
  const p99 = timeSeriesData.length > 0
    ? timeSeriesData.reduce((sum, point) => sum + (point.p99_response_time ?? 0), 0) / timeSeriesData.length
    : 0

  return (
    <div className="space-y-6 pb-8">
      {/* Dashboard Header */}
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive real-time insights into your API's performance, traffic patterns, errors, and global reach"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <DataFreshnessIndicator
              isFetching={summary.isFetching || timeSeries.isFetching}
              dataUpdatedAt={summary.dataUpdatedAt}
              onRefresh={handleRefreshAll}
            />
            <TimeRangePicker value={params} onChange={setParams} showGranularity />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        }
      />

      {/* Period Comparison */}
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

      {/* Core Metrics */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StaggerItem>
            <StatCard
              title="Total Requests"
              value={formatNumber(s?.total_requests ?? 0)}
              icon={Activity}
              iconClassName="bg-primary/10 text-primary"
              accentColor="var(--chart-1)"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Error Rate"
              value={formatPercent(
                s && s.total_requests > 0
                  ? (s.error_requests / s.total_requests) * 100
                  : 0
              )}
              icon={AlertTriangle}
              iconClassName="bg-destructive/10 text-destructive"
              accentColor="var(--destructive)"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Avg Response"
              value={formatMs(s?.avg_response_time_ms ?? 0)}
              icon={Clock}
              iconClassName="bg-chart-2/10 text-chart-2"
              accentColor="var(--chart-2)"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="Success Rate"
              value={formatPercent(s?.success_rate ?? 0)}
              icon={CheckCircle}
              iconClassName="bg-success/10 text-success"
              accentColor="var(--chart-3)"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="P95 Latency"
              value={formatMs(p95)}
              icon={Timer}
              iconClassName="bg-chart-3/10 text-chart-3"
              accentColor="var(--chart-4)"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title="P99 Latency"
              value={formatMs(p99)}
              icon={Zap}
              iconClassName="bg-chart-4/10 text-chart-4"
              accentColor="var(--chart-5)"
            />
          </StaggerItem>
        </StaggerGroup>
      )}

      {/* Time Series Charts - Primary Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RequestVolumeChart
          data={timeSeriesData}
          isLoading={timeSeries.isLoading}
          days={normalizedParams.days}
        />
        <ErrorRateChart
          data={timeSeriesData}
          isLoading={timeSeries.isLoading}
          days={normalizedParams.days}
        />
      </div>

      {/* Response Time Analysis */}
      <ResponseTimeChart
        data={timeSeriesData}
        isLoading={timeSeries.isLoading}
        days={normalizedParams.days}
      />

      {/* Performance Distribution & Categories */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ResponseTimeCategories
          data={timeSeriesData}
          isLoading={timeSeries.isLoading}
        />
        <ResponseTimeDistribution
          data={timeSeriesData}
          isLoading={timeSeries.isLoading}
        />
      </div>

      {/* Percentile Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="P50 Response Time"
          value={formatMs(p50)}
          accentColor="var(--chart-3)"
        />
        <StatCard
          title="P90 Response Time"
          value={formatMs(p90)}
          accentColor="var(--chart-4)"
        />
        <StatCard
          title="P95 Response Time"
          value={formatMs(p95)}
          accentColor="var(--warning)"
        />
        <StatCard
          title="P99 Response Time"
          value={formatMs(p99)}
          accentColor="var(--destructive)"
        />
      </div>

      {/* Traffic & Status Analysis */}
      <div className="grid gap-6 lg:grid-cols-3">
        <StatusBreakdown
          data={summary.data?.status_breakdown ?? {}}
          isLoading={summary.isLoading}
        />
        <div className="lg:col-span-2">
          <TopEndpointsTable
            data={endpoints.data?.endpoints ?? []}
            isLoading={endpoints.isLoading}
          />
        </div>
      </div>

      {/* Endpoint Performance Deep Dive */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SlowEndpointsTable
          data={slowEndpoints.data?.slow_endpoints ?? []}
          isLoading={slowEndpoints.isLoading}
        />
        <UserAgentBreakdown
          data={userAgents.data?.user_agents ?? []}
          isLoading={userAgents.isLoading}
        />
      </div>

      {/* Error Intelligence */}
      <ErrorClusters
        data={errorClusters.data}
        isLoading={errorClusters.isLoading}
      />

      {/* Geographic Insights */}
      <GeoWorldMap
        countries={geoOverview.data?.countries ?? []}
        isLoading={geoOverview.isLoading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GeoPerformance
          fastest={geoPerformance.data?.fastest_regions ?? []}
          slowest={geoPerformance.data?.slowest_regions ?? []}
          highestErrors={geoPerformance.data?.highest_error_rate_regions ?? []}
          isLoading={geoPerformance.isLoading}
        />
        <GeoISPTable
          isps={geoISPs.data?.isps ?? []}
          isLoading={geoISPs.isLoading}
        />
      </div>

      {/* Payload & Bandwidth Intelligence */}
      <PayloadSizeAnalytics
        data={timeSeriesData}
        isLoading={timeSeries.isLoading}
        days={normalizedParams.days}
      />

      <EndpointSizeBreakdown
        endpoints={endpoints.data?.endpoints ?? []}
        isLoading={endpoints.isLoading}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
      />
    </div>
  )
}
