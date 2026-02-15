import { useMemo, useState } from 'react'
import { DataTable } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime, formatPercent, formatMs } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { useSLAIncidents } from '../hooks'
import type { Column } from '@/components/shared/data-table'
import type { DowntimeIncident } from '../types'

interface IncidentsTableProps {
  projectId: string
  slaId: string
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
}

function IncidentsTable({ projectId, slaId }: IncidentsTableProps) {
  const tz = useTimezone()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { data, isLoading } = useSLAIncidents(projectId, slaId)

  const columns = useMemo<Column<DowntimeIncident>[]>(() => [
    {
      header: 'Started At',
      accessor: 'started_at',
      cell: (row) => formatDateTime(row.started_at, tz),
    },
    {
      header: 'Duration',
      accessor: 'duration_seconds',
      cell: (row) => formatDuration(row.duration_seconds),
    },
    {
      header: 'Root Cause',
      accessor: 'root_cause_display',
      cell: (row) => (
        <Badge variant="secondary">{row.root_cause_display}</Badge>
      ),
    },
    {
      header: 'Endpoints',
      accessor: 'affected_endpoints',
      cell: (row) => (
        <span title={row.affected_endpoints.join(', ')}>
          {row.affected_endpoints.length} endpoint{row.affected_endpoints.length !== 1 ? 's' : ''}
        </span>
      ),
    },
    {
      header: 'Error Rate',
      accessor: 'avg_error_rate',
      cell: (row) => formatPercent(row.avg_error_rate),
    },
    {
      header: 'Avg Response',
      accessor: 'avg_response_time',
      cell: (row) => formatMs(row.avg_response_time),
    },
    {
      header: 'Status',
      accessor: 'is_resolved',
      cell: (row) => (
        <Badge variant={row.is_resolved ? 'success' : 'warning'}>
          {row.is_resolved ? 'Resolved' : 'Ongoing'}
        </Badge>
      ),
    },
  ], [tz])

  const incidents = data?.incidents ?? []
  const paginatedIncidents = incidents.slice((page - 1) * pageSize, page * pageSize)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Downtime Incidents
          {data && (
            <span className="ml-2 text-muted-foreground font-normal">
              ({data.total_incidents} total)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={paginatedIncidents}
          pagination={{
            page,
            pageSize,
            total: incidents.length,
          }}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPage(1)
          }}
          isLoading={isLoading}
          rowKey={(row) => row.id}
        />
      </CardContent>
    </Card>
  )
}

export { IncidentsTable }
