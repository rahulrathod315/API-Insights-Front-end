import { useMemo } from 'react'
import { differenceInCalendarDays, isValid, parseISO, subDays } from 'date-fns'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ComparisonSummaryHeader } from '../components/comparison-summary-header'
import { PeriodComparison } from '../components/period-comparison'
import { RequestVolumeChart } from '../components/request-volume-chart'
import { ErrorRateChart } from '../components/error-rate-chart'
import { ResponseTimeChart } from '../components/response-time-chart'
import { StatusBreakdown } from '../components/status-breakdown'
import { TopEndpointsTable } from '../components/top-endpoints-table'
import {
  useSummary,
  useTimeSeries,
  useComparison,
  useRequestsPerEndpoint,
} from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { formatNumber, formatMs, formatPercent, formatDate } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
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

const QUICK_LINKS = [
  {
    title: 'Traffic Analytics',
    description: 'Request volume and distribution',
    icon: Activity,
    href: 'traffic',
    color: 'text-blue-500',
  },
  {
    title: 'Performance',
    description: 'Response times and latency',
    icon: Zap,
    href: 'performance',
    color: 'text-yellow-500',
  },
  {
    title: 'Error Analysis',
    description: 'Error rates and debugging',
    icon: AlertTriangle,
    href: 'errors',
    color: 'text-red-500',
  },
  {
    title: 'Geographic',
    description: 'Global traffic patterns',
    icon: Globe,
    href: 'geo',
    color: 'text-green-500',
  },
  {
    title: 'Endpoints',
    description: 'Per-endpoint metrics',
    icon: TrendingUp,
    href: 'endpoints',
    color: 'text-purple-500',
  },
  {
    title: 'User Agents',
    description: 'Client distribution',
    icon: Users,
    href: 'traffic',
    color: 'text-cyan-500',
  },
]

export default function AnalyticsOverviewPage() {
  const { project } = useProjectContext()
  const { params, setParams } = useAnalyticsParams()
  const normalizedParams = normalizeParams(params)
  const projectId = String(project.id)
  const tz = useTimezone()

  const summary = useSummary(projectId, normalizedParams)
  const timeSeriesParams = { ...normalizedParams, granularity: getGranularity(normalizedParams.days) }
  const timeSeries = useTimeSeries(projectId, timeSeriesParams)
  const endpoints = useRequestsPerEndpoint(projectId, normalizedParams)

  // Comparison params: previous period of equal length immediately before current
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

  const summaryData = summary.data?.summary
  const errorRate = summaryData
    ? summaryData.total_requests > 0
      ? (summaryData.error_requests / summaryData.total_requests) * 100
      : 0
    : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Overview"
        description="Complete view of your API's performance and usage"
        actions={<TimeRangePicker value={params} onChange={setParams} />}
      />

      {/* ── 4 Stat Cards ── */}
      {summary.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : summaryData ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Requests"
            value={formatNumber(summaryData.total_requests)}
            subtitle={`${formatNumber(summaryData.successful_requests)} successful`}
            icon={Activity}
            iconClassName="bg-primary/10 text-primary"
            accentColor="var(--chart-1)"
          />
          <StatCard
            title="Success Rate"
            value={formatPercent(summaryData.success_rate)}
            subtitle={`${formatNumber(summaryData.successful_requests)} successful requests`}
            icon={CheckCircle}
            iconClassName="bg-success/10 text-success"
            accentColor="var(--success)"
          />
          <StatCard
            title="Error Rate"
            value={formatPercent(errorRate)}
            subtitle={`${formatNumber(summaryData.error_requests)} failed requests`}
            icon={AlertTriangle}
            iconClassName="bg-destructive/10 text-destructive"
            accentColor="var(--destructive)"
            invertTrend
          />
          <StatCard
            title="Avg Response"
            value={formatMs(summaryData.avg_response_time_ms)}
            subtitle="Average across all requests"
            icon={Clock}
            iconClassName="bg-blue-500/10 text-blue-500"
            accentColor="#3B82F6"
            invertTrend
          />
        </div>
      ) : null}

      {/* ── Comparison Summary Header ── */}
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

      {/* ── Period Comparison + Charts row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Period Comparison card (Latency-Profile style) */}
        <div className="lg:col-span-1">
          {comparison.data ? (
            <PeriodComparison
              data={comparison.data}
              isLoading={comparison.isLoading}
              className="h-full"
            />
          ) : comparison.isLoading ? (
            <CardSkeleton className="h-full" />
          ) : null}
        </div>

        {/* Request Volume + Error Rate charts stacked */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div id="chart-requests">
            <RequestVolumeChart
              data={timeSeries.data?.data ?? []}
              isLoading={timeSeries.isLoading}
              days={normalizedParams.days}
            />
          </div>
          <div id="chart-error-rate">
            <ErrorRateChart
              data={timeSeries.data?.data ?? []}
              isLoading={timeSeries.isLoading}
              days={normalizedParams.days}
            />
          </div>
        </div>
      </div>

      {/* ── Latency Trends ── */}
      <div id="chart-performance">
        <ResponseTimeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
          days={normalizedParams.days}
        />
      </div>

      {/* ── Quick Links ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Explore Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href + link.title}
                to={`/projects/${project.id}/analytics/${link.href}`}
                className="group flex items-start gap-3 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:bg-accent hover:shadow-md"
              >
                <div className={`rounded-md bg-muted p-2 group-hover:bg-background ${link.color}`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{link.title}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Status Breakdown & Top Endpoints ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <StatusBreakdown
          data={summary.data?.status_breakdown ?? {}}
          isLoading={summary.isLoading}
        />
        <div className="lg:col-span-2">
          <TopEndpointsTable
            data={endpoints.data?.endpoints.slice(0, 10) ?? []}
            isLoading={endpoints.isLoading}
          />
        </div>
      </div>
    </div>
  )
}
