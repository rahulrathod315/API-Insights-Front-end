import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
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
import { useEndpointMetrics, useTimeSeries } from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { formatNumber, formatMs, formatBytes } from '@/lib/utils/format'
import { ArrowUpFromLine, ArrowDownToLine } from 'lucide-react'

export default function EndpointAnalyticsPage() {
  const { project } = useProjectContext()
  const { endpointId } = useParams<{ endpointId: string }>()
  const { params, setParams } = useAnalyticsParams()

  const { data, isLoading } = useEndpointMetrics(
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

  // Convert status_distribution array to Record<string, number> for StatusBreakdown
  const statusBreakdown: Record<string, number> = {}
  if (data?.status_distribution) {
    for (const item of data.status_distribution) {
      statusBreakdown[String(item.status_code)] = item.count
    }
  }

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
            <TimeRangePicker value={params} onChange={setParams} />
          }
        />
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Requests"
            value={formatNumber(data.summary.total_requests)}
          />
          <StatCard
            title="Avg Response Time"
            value={formatMs(data.summary.avg_response_time_ms)}
          />
          <StatCard
            title="Min Response Time"
            value={formatMs(data.summary.min_response_time_ms)}
          />
          <StatCard
            title="Max Response Time"
            value={formatMs(data.summary.max_response_time_ms)}
          />
          <StatCard
            title="Request Size"
            value={formatBytes(data.summary.total_request_size_bytes)}
            icon={ArrowUpFromLine}
            iconClassName="bg-chart-1/10 text-chart-1"
          />
          <StatCard
            title="Response Size"
            value={formatBytes(data.summary.total_response_size_bytes)}
            icon={ArrowDownToLine}
            iconClassName="bg-chart-2/10 text-chart-2"
          />
        </div>
      ) : null}

      {/* Percentile cards */}
      {data && !isLoading && (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard
            title="P50 Response Time"
            value={formatMs(data.percentiles.p50)}
          />
          <StatCard
            title="P90 Response Time"
            value={formatMs(data.percentiles.p90)}
          />
          <StatCard
            title="P95 Response Time"
            value={formatMs(data.percentiles.p95)}
          />
          <StatCard
            title="P99 Response Time"
            value={formatMs(data.percentiles.p99)}
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
            showResponseTime={true}
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
