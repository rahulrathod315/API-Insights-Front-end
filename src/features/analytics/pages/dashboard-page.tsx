import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, Layers, Percent, TrendingUp, Search, ArrowUpRight } from 'lucide-react'
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { StaggerGroup, StaggerItem, AnimatedNumber } from '@/components/animation'
import { DataTable } from '@/components/shared/data-table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { TimeRangePicker } from '../components/time-range-picker'
import { DataFreshnessIndicator } from '../components/data-freshness-indicator'
import { useDashboard } from '../hooks'
import { useAnalyticsParams } from '../analytics-params-context'
import { formatDate, formatNumber, formatPercent } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { cn } from '@/lib/utils/cn'
import type { AnalyticsParams, DashboardData } from '../types'
import type { Column } from '@/components/shared/data-table'

function normalizeDashboardParams(params: AnalyticsParams): AnalyticsParams {
  if (params.start_date && params.end_date) {
    const start = parseISO(params.start_date)
    const end = parseISO(params.end_date)
    if (isValid(start) && isValid(end)) {
      const diff = Math.max(1, differenceInCalendarDays(end, start) + 1)
      return { days: Math.min(diff, 90) }
    }
  }
  return params
}

type ProjectRow = DashboardData['projects'][number]

const DEFAULT_PAGE_SIZE = 10

function ProgressBar({
  value,
  max,
  color = 'var(--chart-1)',
}: {
  value: number
  max: number
  color?: string
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function DashboardPage() {
  const { params, setParams } = useAnalyticsParams()
  const normalizedParams = normalizeDashboardParams(params)
  const tz = useTimezone()
  const [tablePage, setTablePage] = useState(1)
  const [tablePageSize, setTablePageSize] = useState(DEFAULT_PAGE_SIZE)

  const dashboard = useDashboard(normalizedParams)

  const totals = useMemo(
    () =>
      dashboard.data?.totals ?? {
        projects: 0,
        total_requests: 0,
        total_errors: 0,
        error_rate: 0,
      },
    [dashboard.data?.totals]
  )

  const projects = useMemo(() => dashboard.data?.projects ?? [], [dashboard.data?.projects])
  const period = dashboard.data?.period
  const periodLabel =
    period?.start_date && period?.end_date
      ? `${formatDate(period.start_date, tz)} — ${formatDate(period.end_date, tz)}`
      : undefined

  const topActiveProjects = useMemo(
    () => [...projects].sort((a, b) => b.request_count - a.request_count).slice(0, 5),
    [projects]
  )
  const maxRequests = useMemo(
    () => Math.max(...projects.map((p) => p.request_count), 1),
    [projects]
  )

  const riskiestProjects = useMemo(
    () =>
      [...projects]
        .filter((p) => p.request_count > 0)
        .map((p) => ({
          ...p,
          error_rate: (p.error_count / p.request_count) * 100,
        }))
        .sort((a, b) => b.error_rate - a.error_rate)
        .slice(0, 5),
    [projects]
  )
  const maxErrorRate = useMemo(
    () => Math.max(...riskiestProjects.map((p) => p.error_rate), 0.01),
    [riskiestProjects]
  )

  const paginatedProjects = useMemo(() => {
    const start = (tablePage - 1) * tablePageSize
    return projects.slice(start, start + tablePageSize)
  }, [projects, tablePage, tablePageSize])

  const columns = useMemo<Column<ProjectRow>[]>(
    () => [
      {
        header: 'Project',
        accessor: 'name',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Link
              to={`/projects/${row.id}/analytics`}
              className="group flex items-center gap-1.5 font-medium text-foreground hover:text-primary"
            >
              {row.name}
              <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>
        ),
      },
      {
        header: 'Endpoints',
        accessor: 'endpoint_count',
        cell: (row) => (
          <span className="tabular-nums text-muted-foreground">{formatNumber(row.endpoint_count)}</span>
        ),
        className: 'text-right w-[110px]',
      },
      {
        header: 'Requests',
        accessor: 'request_count',
        cell: (row) => (
          <span className="tabular-nums font-medium">{formatNumber(row.request_count)}</span>
        ),
        className: 'text-right w-[130px]',
      },
      {
        header: 'Errors',
        accessor: 'error_count',
        cell: (row) => (
          <span className="tabular-nums text-muted-foreground">{formatNumber(row.error_count)}</span>
        ),
        className: 'text-right w-[110px]',
      },
      {
        header: 'Error Rate',
        accessor: 'error_count',
        cell: (row) => {
          const rate = row.request_count > 0 ? (row.error_count / row.request_count) * 100 : 0
          return (
            <span
              className={cn(
                'tabular-nums font-semibold',
                rate > 5
                  ? 'text-destructive'
                  : rate > 1
                  ? 'text-warning'
                  : 'text-success'
              )}
            >
              {formatPercent(rate)}
            </span>
          )
        },
        className: 'text-right w-[120px]',
      },
    ],
    []
  )

  const showEmptyState = !dashboard.isLoading && projects.length === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Dashboard"
          description="Global health and traffic overview across all your API projects"
          className="p-0"
        />
        <div className="flex shrink-0 flex-row items-center gap-3">
          <DataFreshnessIndicator
            isFetching={dashboard.isFetching}
            dataUpdatedAt={dashboard.dataUpdatedAt}
            onRefresh={() => dashboard.refetch()}
          />
          <TimeRangePicker value={params} onChange={setParams} />
        </div>
      </div>

      {/* Period label */}
      {periodLabel && !showEmptyState && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span>
            Reporting window:{' '}
            <span className="font-medium text-foreground">{periodLabel}</span>
          </span>
        </div>
      )}

      {showEmptyState ? (
        <EmptyState
          icon={Search}
          title="No data found"
          description="No traffic data for the selected period. Adjust your filters or check if your projects are sending data."
          action={{
            label: 'Reset filters',
            onClick: () => setParams({ days: 7 }),
          }}
          className="min-h-[400px]"
        />
      ) : (
        <>
          {/* Stat cards */}
          <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatCard
                title="Active Projects"
                value={<AnimatedNumber value={totals.projects} formatter={formatNumber} />}
                icon={Layers}
                iconClassName="bg-blue-500/10 text-blue-500"
                accentColor="#3B82F6"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Total Requests"
                value={<AnimatedNumber value={totals.total_requests} formatter={formatNumber} />}
                icon={Activity}
                iconClassName="bg-primary/10 text-primary"
                accentColor="var(--chart-1)"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Total Errors"
                value={<AnimatedNumber value={totals.total_errors} formatter={formatNumber} />}
                icon={AlertTriangle}
                iconClassName="bg-destructive/10 text-destructive"
                accentColor="var(--chart-2)"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Avg Error Rate"
                value={<AnimatedNumber value={totals.error_rate} formatter={formatPercent} />}
                icon={Percent}
                iconClassName="bg-success/10 text-success"
                accentColor="var(--chart-3)"
                invertTrend
              />
            </StaggerItem>
          </StaggerGroup>

          {/* Top projects + riskiest */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Top active */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Top Active Projects</CardTitle>
                <CardDescription className="text-xs">Highest request volume in this period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {topActiveProjects.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No project activity yet.
                  </p>
                ) : (
                  topActiveProjects.map((project) => (
                    <div key={project.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          to={`/projects/${project.id}/analytics`}
                          className="truncate text-sm font-medium text-foreground hover:text-primary"
                        >
                          {project.name}
                        </Link>
                        <span className="shrink-0 text-sm tabular-nums font-semibold">
                          {formatNumber(project.request_count)}
                        </span>
                      </div>
                      <ProgressBar value={project.request_count} max={maxRequests} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Riskiest */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Riskiest Projects</CardTitle>
                <CardDescription className="text-xs">Projects with the highest error rates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskiestProjects.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No error data yet.
                  </p>
                ) : (
                  riskiestProjects.map((project) => (
                    <div key={project.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <Link
                          to={`/projects/${project.id}/analytics`}
                          className="truncate text-sm font-medium text-foreground hover:text-primary"
                        >
                          {project.name}
                        </Link>
                        <span
                          className={cn(
                            'shrink-0 text-sm tabular-nums font-semibold',
                            project.error_rate > 5 ? 'text-destructive' : 'text-warning'
                          )}
                        >
                          {formatPercent(project.error_rate)}
                        </span>
                      </div>
                      <ProgressBar
                        value={project.error_rate}
                        max={maxErrorRate}
                        color={
                          project.error_rate > 5
                            ? 'var(--destructive)'
                            : 'var(--warning)'
                        }
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full projects table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">All Projects Performance</CardTitle>
              <CardDescription className="text-xs">
                Detailed breakdown of endpoints and traffic per project
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                columns={columns}
                data={paginatedProjects}
                isLoading={dashboard.isLoading}
                pagination={
                  projects.length > 0
                    ? { page: tablePage, pageSize: tablePageSize, total: projects.length }
                    : undefined
                }
                onPageChange={setTablePage}
                onPageSizeChange={(size) => {
                  setTablePageSize(size)
                  setTablePage(1)
                }}
                rowKey={(row) => row.id}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
