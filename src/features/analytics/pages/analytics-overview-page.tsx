import { useMemo } from 'react'
import { differenceInCalendarDays, isValid, parseISO, subDays } from 'date-fns'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProjectContext } from '@/features/projects/project-context'
import { TimeRangePicker } from '../components/time-range-picker'
import { ComparisonSummaryHeader } from '../components/comparison-summary-header'
import { OverviewStats } from '../components/overview-stats'
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
import { formatDate } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { ArrowRight, Activity, AlertTriangle, Zap, Globe, TrendingUp, Users } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Overview"
        description="Complete view of your API's performance and usage"
        actions={<TimeRangePicker value={params} onChange={setParams} />}
      />

      {/* Comparison Summary Header */}
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

      {/* Key Metrics Cards */}
      <OverviewStats data={summary.data!} isLoading={summary.isLoading} />

      {/* Quick Links to Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Explore Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
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

      {/* Mini Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request Volume */}
        <div id="chart-requests">
          <RequestVolumeChart
            data={timeSeries.data?.data ?? []}
            isLoading={timeSeries.isLoading}
            days={normalizedParams.days}
          />
        </div>

        {/* Error Rate */}
        <div id="chart-error-rate">
          <ErrorRateChart
            data={timeSeries.data?.data ?? []}
            isLoading={timeSeries.isLoading}
            days={normalizedParams.days}
          />
        </div>
      </div>

      {/* Performance Chart */}
      <div id="chart-performance">
        <ResponseTimeChart
          data={timeSeries.data?.data ?? []}
          isLoading={timeSeries.isLoading}
          days={normalizedParams.days}
        />
      </div>

      {/* Status Breakdown & Top Endpoints */}
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
