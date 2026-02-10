import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, Layers, Percent } from 'lucide-react'
import { differenceInCalendarDays, isValid, parseISO } from 'date-fns'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { DataTable } from '@/components/shared/data-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeRangePicker } from '../components/time-range-picker'
import { useDashboard } from '../hooks'
import { formatDate, formatNumber, formatPercent } from '@/lib/utils/format'
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

export default function DashboardPage() {
  const [params, setParams] = useState<AnalyticsParams>({ days: 7 })
  const normalizedParams = normalizeDashboardParams(params)

  const dashboard = useDashboard(normalizedParams)

  const totals = dashboard.data?.totals ?? {
    projects: 0,
    total_requests: 0,
    total_errors: 0,
    error_rate: 0,
  }

  const projects = dashboard.data?.projects ?? []

  const period = dashboard.data?.period
  const periodLabel = period?.start_date && period?.end_date
    ? `${formatDate(period.start_date)} - ${formatDate(period.end_date)}`
    : undefined

  const topActiveProjects = useMemo(() => (
    [...projects].sort((a, b) => b.request_count - a.request_count).slice(0, 5)
  ), [projects])

  const riskiestProjects = useMemo(() => (
    [...projects]
      .filter((project) => project.request_count > 0)
      .map((project) => ({
        ...project,
        error_rate: (project.error_count / project.request_count) * 100,
      }))
      .sort((a, b) => b.error_rate - a.error_rate)
      .slice(0, 5)
  ), [projects])

  const columns = useMemo<Column<ProjectRow>[]>(
    () => [
      {
        header: 'Project',
        accessor: 'name',
        cell: (row) => (
          <Link
            to={`/projects/${row.id}/analytics`}
            className="font-medium text-primary hover:underline"
          >
            {row.name}
          </Link>
        ),
      },
      {
        header: 'Endpoints',
        accessor: 'endpoint_count',
        cell: (row) => (
          <span className="tabular-nums">{formatNumber(row.endpoint_count)}</span>
        ),
        className: 'text-right w-[120px]',
      },
      {
        header: 'Requests',
        accessor: 'request_count',
        cell: (row) => (
          <span className="tabular-nums">{formatNumber(row.request_count)}</span>
        ),
        className: 'text-right w-[140px]',
      },
      {
        header: 'Errors',
        accessor: 'error_count',
        cell: (row) => (
          <span className="tabular-nums">{formatNumber(row.error_count)}</span>
        ),
        className: 'text-right w-[120px]',
      },
      {
        header: 'Error Rate',
        accessor: 'error_count',
        cell: (row) => {
          const rate = row.request_count > 0
            ? (row.error_count / row.request_count) * 100
            : 0
          return (
            <span className="tabular-nums">
              {formatPercent(rate)}
            </span>
          )
        },
        className: 'text-right w-[140px]',
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A quick, cross-project pulse of traffic and stability"
        actions={<TimeRangePicker value={params} onChange={setParams} />}
      />

      {periodLabel && (
        <p className="text-sm text-muted-foreground">
          Reporting window: {periodLabel}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Projects Tracked"
          value={formatNumber(totals.projects)}
          icon={Layers}
        />
        <StatCard
          title="Total Requests"
          value={formatNumber(totals.total_requests)}
          icon={Activity}
        />
        <StatCard
          title="Total Errors"
          value={formatNumber(totals.total_errors)}
          icon={AlertTriangle}
        />
        <StatCard
          title="Error Rate"
          value={formatPercent(totals.error_rate)}
          icon={Percent}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Top Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topActiveProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No project activity yet.</p>
            ) : (
              topActiveProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-4">
                  <Link
                    to={`/projects/${project.id}/analytics`}
                    className="font-medium text-primary hover:underline"
                  >
                    {project.name}
                  </Link>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {formatNumber(project.request_count)} requests
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Riskiest Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {riskiestProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No error data yet.</p>
            ) : (
              riskiestProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between gap-4">
                  <Link
                    to={`/projects/${project.id}/analytics`}
                    className="font-medium text-primary hover:underline"
                  >
                    {project.name}
                  </Link>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {formatPercent(project.error_rate)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Project Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={dashboard.data?.projects ?? []}
            isLoading={dashboard.isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
