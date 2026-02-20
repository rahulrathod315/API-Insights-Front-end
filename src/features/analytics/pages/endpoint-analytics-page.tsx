import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Activity, Zap, ArrowDownToLine, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { useProjectContext } from '@/features/projects/project-context'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { ResponseTimeChart } from '../components/response-time-chart'
import { ResponseTimeDistribution } from '../components/response-time-distribution'
import { StatusBreakdown } from '../components/status-breakdown'
import { HourlyDistribution } from '../components/hourly-distribution'
import { RecentErrorsTable } from '../components/recent-errors-table'
import { TimeRangePicker } from '../components/time-range-picker'
import { DataFreshnessIndicator } from '../components/data-freshness-indicator'
import { useEndpointMetrics, useTimeSeries } from '@/features/analytics/hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { formatNumber, formatMs, formatBytes, formatPercent } from '@/lib/utils/format'

export default function EndpointAnalyticsPage() {
  const { project } = useProjectContext()
  const { endpointId } = useParams<{ endpointId: string }>()
  const { params, setParams } = useAnalyticsParams()

  // Ensure we don't pass an endpoint_id from global params that might conflict with the URL
  const metricsParams = useMemo(() => {
    const { endpoint_id, ...rest } = params
    return rest
  }, [params])

  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useEndpointMetrics(
    String(project?.id || ''),
    endpointId ?? '',
    metricsParams
  )

  // Use selected granularity if available, otherwise fallback to recommended defaults based on timeframe
  const activeGranularity = useMemo(() => {
    if (params.granularity) return params.granularity
    
    if (!params.days || params.days <= 1) return 'hour'
    if (params.days <= 90) return 'day'
    return 'week'
  }, [params.days, params.granularity])

  const timeSeries = useTimeSeries(String(project?.id || ''), {
    ...params,
    granularity: activeGranularity,
    endpoint_id: endpointId ? Number(endpointId) : undefined,
  })

  const handleRefresh = () => {
    refetch()
    timeSeries.refetch()
  }

  // Derived data with safety checks
  const statusBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {}
    if (data?.status_distribution) {
      for (const item of data.status_distribution) {
        breakdown[String(item.status_code)] = item.count
      }
    }
    return breakdown
  }, [data?.status_distribution])

  const { errorRate, successRate, errorCount } = useMemo(() => {
    if (!data?.summary || !data?.status_distribution) {
      return { errorRate: 0, successRate: 0, errorCount: 0 }
    }

    const count = data.status_distribution
      .filter((s) => s.status_code >= 400)
      .reduce((sum, s) => sum + s.count, 0)
    
    const rate = (data.summary.total_requests || 0) > 0
      ? (count / data.summary.total_requests) * 100
      : 0
      
    return { 
      errorRate: rate,
      successRate: 100 - rate,
      errorCount: count
    }
  }, [data?.summary, data?.status_distribution])

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
            data?.endpoint
              ? `Performance metrics for ${data.endpoint.name || data.endpoint.path}`
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

      {/* Consolidate to 4 high-signal Stat cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data?.summary ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Traffic"
            value={formatNumber(data.summary.total_requests)}
            subtitle={`${formatPercent(successRate)} success rate`}
            icon={Activity}
            iconClassName="bg-primary/10 text-primary"
            accentColor="var(--chart-1)"
          />
          <StatCard
            title="Errors"
            value={formatPercent(errorRate)}
            subtitle={`${formatNumber(errorCount)} failed requests`}
            icon={AlertTriangle}
            iconClassName="bg-destructive/10 text-destructive"
            accentColor="var(--destructive)"
            invertTrend
          />
          <StatCard
            title="Performance (P95)"
            value={formatMs(data.percentiles?.p95 || 0)}
            subtitle={`Avg: ${formatMs(data.summary.avg_response_time_ms || 0)} | P99: ${formatMs(data.percentiles?.p99 || 0)}`}
            icon={Zap}
            iconClassName="bg-success/10 text-success"
            accentColor="var(--chart-3)"
            invertTrend
          />
          <StatCard
            title="Payload Size"
            value={formatBytes(data.summary.total_response_size_bytes || 0)}
            subtitle={`Avg Req: ${formatBytes((data.summary.total_request_size_bytes || 0) / (data.summary.total_requests || 1))}`}
            icon={ArrowDownToLine}
            iconClassName="bg-chart-4/10 text-chart-4"
            accentColor="var(--chart-4)"
          />
        </div>
      ) : null}

      {/* Time series charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RequestVolumeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
          days={params.days}
          granularity={activeGranularity}
        />
        <ResponseTimeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
          days={params.days}
          granularity={activeGranularity}
        />
      </div>

      {/* Performance Analysis Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ResponseTimeDistribution
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
        />
        
        {/* Latency Profile - Meaningful representation of Min/Max/Percentiles */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Latency Profile</CardTitle>
            <CardDescription>Detailed response time characteristics</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading ? (
              <div className="space-y-4 py-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : data?.percentiles && data?.summary ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Absolute Minimum</p>
                    <p className="text-lg font-bold text-foreground">{formatMs(data.summary?.min_response_time_ms || 0)}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Absolute Maximum</p>
                    <p className="text-lg font-bold text-foreground">{formatMs(data.summary?.max_response_time_ms || 0)}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">P50 (Median)</span>
                    <span className="font-mono text-sm font-bold text-foreground">{formatMs(data.percentiles?.p50 || 0)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/40">
                    <div className="h-full rounded-full bg-chart-1" style={{ width: '50%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-medium text-muted-foreground">P90</span>
                    <span className="font-mono text-sm font-bold text-foreground">{formatMs(data.percentiles?.p90 || 0)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/40">
                    <div className="h-full rounded-full bg-chart-2" style={{ width: '90%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-medium text-muted-foreground">P95</span>
                    <span className="font-mono text-sm font-bold text-foreground">{formatMs(data.percentiles?.p95 || 0)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/40">
                    <div className="h-full rounded-full bg-chart-3" style={{ width: '95%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm font-medium text-muted-foreground">P99</span>
                    <span className="font-mono text-sm font-bold text-foreground">{formatMs(data.percentiles?.p99 || 0)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted/40">
                    <div className="h-full rounded-full bg-destructive" style={{ width: '99%' }} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No percentile data available</p>
            )}
          </CardContent>
        </Card>
      </div>

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
