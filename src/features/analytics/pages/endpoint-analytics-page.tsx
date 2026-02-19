import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Activity, Clock, Zap, Timer, ArrowUpFromLine, ArrowDownToLine, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { useProjectContext } from '@/features/projects/project-context'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { StatusBreakdown } from '../components/status-breakdown'
import { HourlyDistribution } from '../components/hourly-distribution'
import { RecentErrorsTable } from '../components/recent-errors-table'
import { TimeRangePicker } from '../components/time-range-picker'
import { DataFreshnessIndicator } from '../components/data-freshness-indicator'
import { useEndpointMetrics, useTimeSeries } from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { formatNumber, formatMs, formatBytes, formatPercent } from '@/lib/utils/format'

export default function EndpointAnalyticsPage() {
  const { project } = useProjectContext()
  const { endpointId } = useParams<{ endpointId: string }>()
  const { params, setParams } = useAnalyticsParams()

  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useEndpointMetrics(
    String(project.id),
    endpointId ?? '',
    params
  )

  const granularity = (!params.days || params.days <= 1) ? 'hour' as const
    : params.days <= 90 ? 'day' as const
    : 'week' as const
  const timeSeries = useTimeSeries(String(project.id), {
    ...params,
    granularity,
    endpoint_id: endpointId ? Number(endpointId) : undefined,
  })

  const handleRefresh = () => {
    refetch()
    timeSeries.refetch()
  }

  // Convert status_distribution array to Record<string, number> for StatusBreakdown
  const statusBreakdown: Record<string, number> = {}
  if (data?.status_distribution) {
    for (const item of data.status_distribution) {
      statusBreakdown[String(item.status_code)] = item.count
    }
  }

  const errorCount = data?.status_distribution
    .filter((s) => s.status_code >= 400)
    .reduce((sum, s) => sum + s.count, 0) ?? 0
  const errorRate = data && data.summary.total_requests > 0
    ? (errorCount / data.summary.total_requests) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/projects/${project.id}/endpoints`}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Endpoints
          </Link>
        </Button>

        <PageHeader
          title="Endpoint Analytics"
          description={
            data
              ? `Performance metrics for ${data.endpoint.name}`
              : `Performance metrics for endpoint ${endpointId ?? ''}`
          }
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <DataFreshnessIndicator
                isFetching={isFetching || timeSeries.isFetching}
                dataUpdatedAt={dataUpdatedAt}
                onRefresh={handleRefresh}
              />
              <TimeRangePicker value={params} onChange={setParams} showGranularity />
            </div>
          }
        />
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Requests"
            value={formatNumber(data.summary.total_requests)}
            icon={Activity}
            iconClassName="bg-primary/10 text-primary"
            accentColor="var(--chart-1)"
          />
          <StatCard
            title="Avg Response Time"
            value={formatMs(data.summary.avg_response_time_ms)}
            icon={Clock}
            iconClassName="bg-chart-2/10 text-chart-2"
            accentColor="var(--chart-2)"
          />
          <StatCard
            title="Error Rate"
            value={formatPercent(errorRate)}
            icon={AlertTriangle}
            iconClassName="bg-destructive/10 text-destructive"
            accentColor="var(--destructive)"
          />
          <StatCard
            title="Min Response Time"
            value={formatMs(data.summary.min_response_time_ms)}
            icon={Zap}
            iconClassName="bg-success/10 text-success"
            accentColor="var(--chart-3)"
          />
          <StatCard
            title="Request Size"
            value={formatBytes(data.summary.total_request_size_bytes)}
            icon={ArrowUpFromLine}
            iconClassName="bg-chart-4/10 text-chart-4"
            accentColor="var(--chart-4)"
          />
          <StatCard
            title="Response Size"
            value={formatBytes(data.summary.total_response_size_bytes)}
            icon={ArrowDownToLine}
            iconClassName="bg-chart-5/10 text-chart-5"
            accentColor="var(--chart-5)"
          />
        </div>
      ) : null}

      {/* Percentile cards */}
      {data && !isLoading && (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard
            title="P50 Response Time"
            value={formatMs(data.percentiles.p50)}
            icon={Timer}
            iconClassName="bg-chart-3/10 text-chart-3"
            accentColor="var(--chart-3)"
          />
          <StatCard
            title="P90 Response Time"
            value={formatMs(data.percentiles.p90)}
            icon={Timer}
            iconClassName="bg-chart-4/10 text-chart-4"
            accentColor="var(--chart-4)"
          />
          <StatCard
            title="P95 Response Time"
            value={formatMs(data.percentiles.p95)}
            icon={Timer}
            iconClassName="bg-warning/10 text-warning"
            accentColor="var(--warning)"
          />
          <StatCard
            title="P99 Response Time"
            value={formatMs(data.percentiles.p99)}
            icon={Timer}
            iconClassName="bg-destructive/10 text-destructive"
            accentColor="var(--destructive)"
          />
        </div>
      )}

      {/* Time series chart */}
      <RequestVolumeChart
        data={timeSeries.data?.data ?? []}
        isLoading={timeSeries.isLoading}
        days={params.days}
      />

      {/* Status breakdown + Hourly distribution */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusBreakdown
          data={statusBreakdown}
          isLoading={isLoading}
        />
        {data?.hourly_distribution && (
          <HourlyDistribution
            data={data.hourly_distribution}
            isLoading={isLoading}
            title="24-Hour Traffic Pattern"
          />
        )}
      </div>

      {/* Recent Errors */}
      {data?.recent_errors && data.recent_errors.length > 0 && (
        <RecentErrorsTable
          data={data.recent_errors}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
