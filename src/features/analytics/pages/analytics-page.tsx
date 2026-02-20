import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import { differenceInCalendarDays, isValid, parseISO, subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PageHeader } from '@/components/shared/page-header'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ExportDialog } from '../components/export-dialog'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { StatusBreakdown } from '../components/status-breakdown'
import { TopEndpointsTable } from '../components/top-endpoints-table'
import { ComparisonSummaryHeader } from '../components/comparison-summary-header'
import { DataFreshnessIndicator } from '../components/data-freshness-indicator'
import { ResponseTimeCategories } from '../components/response-time-categories'
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
        successRate={
          comparison.data
            ? (() => {
                const current = 100 - comparison.data.current_period.metrics.error_rate
                const previous = 100 - comparison.data.previous_period.metrics.error_rate
                const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
                return { current, previous, change }
              })()
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

      {/* Time Series Charts - Primary Metrics */}
      <RequestVolumeChart
        data={timeSeriesData}
        isLoading={timeSeries.isLoading}
        days={normalizedParams.days}
      />

      {/* Response Time Distribution & Percentiles */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ResponseTimeCategories
          data={timeSeriesData}
          isLoading={timeSeries.isLoading}
        />
        {(() => {
          const percentiles = [
            { label: 'P50', sublabel: 'Median', value: p50, color: 'var(--chart-3)' },
            { label: 'P90', sublabel: '90th percentile', value: p90, color: 'var(--chart-4)' },
            { label: 'P95', sublabel: '95th percentile', value: p95, color: 'var(--warning)' },
            { label: 'P99', sublabel: '99th percentile', value: p99, color: 'var(--destructive)' },
          ]
          const total = p50 + p90 + p95 + p99
          return (
            <Card className="flex flex-col h-full border-none shadow-md ring-1 ring-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Response Time Percentiles</CardTitle>
                <CardDescription>Proportional breakdown across P50 · P90 · P95 · P99</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                {/* Donut chart */}
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={percentiles}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        cornerRadius={3}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {percentiles.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.color}
                            stroke="var(--background)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg ring-1 ring-border">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                <span className="text-sm font-semibold text-popover-foreground">{d.label}</span>
                                <span className="text-xs text-muted-foreground">{d.sublabel}</span>
                              </div>
                              <p className="font-mono text-sm font-bold" style={{ color: d.color }}>{formatMs(d.value)}</p>
                              <p className="text-xs text-muted-foreground">{total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}% of total</p>
                            </div>
                          )
                        }}
                      />
                      {/* Center label */}
                      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
                        style={{ fill: 'var(--foreground)', fontSize: 15, fontWeight: 700 }}>
                        {formatMs(p99)}
                      </text>
                      <text x="50%" y="57%" textAnchor="middle" dominantBaseline="middle"
                        style={{ fill: 'var(--muted-foreground)', fontSize: 11 }}>
                        P99 max
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend rows */}
                <div className="grid grid-cols-2 gap-2">
                  {percentiles.map((item) => (
                    <div key={item.label} className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold" style={{ color: item.color }}>{item.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{item.sublabel}</p>
                      </div>
                      <span className="font-mono text-xs font-bold tabular-nums">{formatMs(item.value)}</span>
                    </div>
                  ))}
                </div>

                {/* P99 / P50 ratio summary */}
                <div className="mt-auto flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                  <span className="text-xs text-muted-foreground">Tail latency ratio (P99 / P50)</span>
                  <span className="font-mono text-sm font-bold">{p50 > 0 ? `${(p99 / p50).toFixed(1)}×` : '—'}</span>
                </div>
              </CardContent>
            </Card>
          )
        })()}
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
