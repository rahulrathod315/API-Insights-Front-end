import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { formatMs, formatNumber, formatPercent } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Column } from '@/components/shared/data-table'
import type { SlowEndpoint } from '../types'

const DEFAULT_PAGE_SIZE = 10

interface SlowEndpointsTableProps {
  data: SlowEndpoint[]
  isLoading: boolean
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-primary/10 text-primary',
  POST: 'bg-primary/15 text-primary',
  PUT: 'bg-primary/10 text-primary',
  PATCH: 'bg-primary/10 text-primary',
  DELETE: 'bg-primary/10 text-primary',
}

function getResponseTimeClass(ms: number): string {
  if (ms < 200) return 'text-success'
  if (ms < 500) return 'text-warning'
  return 'text-destructive'
}

const columns: Column<SlowEndpoint>[] = [
  {
    header: 'Method',
    accessor: 'method',
    cell: (row) => (
      <Badge
        variant="outline"
        className={cn(
          'font-mono text-xs',
          METHOD_COLORS[row.method] ?? ''
        )}
      >
        {row.method}
      </Badge>
    ),
    className: 'w-[80px]',
  },
  {
    header: 'Path',
    accessor: 'path',
    cell: (row) => (
      <span className="font-mono text-sm">{row.path}</span>
    ),
  },
  {
    header: 'Avg (ms)',
    accessor: 'avg_response_time_ms',
    cell: (row) => (
      <span
        className={cn(
          'tabular-nums font-medium',
          getResponseTimeClass(row.avg_response_time_ms)
        )}
      >
        {formatMs(row.avg_response_time_ms)}
      </span>
    ),
    className: 'text-right w-[100px]',
  },
  {
    header: 'Slow %',
    accessor: 'slow_percent',
    cell: (row) => (
      <span
        className={cn(
          'tabular-nums font-medium',
          row.slow_percent > 50 && 'text-destructive'
        )}
      >
        {formatPercent(row.slow_percent)}
      </span>
    ),
    className: 'text-right w-[100px]',
  },
  {
    header: 'Slow / Total',
    accessor: 'request_count',
    cell: (row) => (
      <span className="tabular-nums">
        {formatNumber(row.slow_request_count)} / {formatNumber(row.request_count)}
      </span>
    ),
    className: 'text-right w-[120px]',
  },
]

function SlowEndpointsTable({ data, isLoading }: SlowEndpointsTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  // Reset page when data changes
  const dataLength = data.length
  useMemo(() => { setPage(1) }, [dataLength])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Slow Endpoints
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          pagination={
            data.length > 0
              ? { page, pageSize, total: data.length }
              : undefined
          }
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          rowKey={(row) => `${row.method}-${row.path}`}
        />
      </CardContent>
    </Card>
  )
}

export { SlowEndpointsTable }
export type { SlowEndpointsTableProps }
