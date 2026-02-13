import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { formatNumber, formatMs, formatPercent } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { Column } from '@/components/shared/data-table'
import type { EndpointStats } from '../types'

const DEFAULT_PAGE_SIZE = 10

interface TopEndpointsTableProps {
  data: EndpointStats[]
  isLoading: boolean
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PATCH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
}

const columns: Column<EndpointStats>[] = [
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
    header: 'Requests',
    accessor: 'total_requests',
    cell: (row) => (
      <span className="tabular-nums">{formatNumber(row.total_requests)}</span>
    ),
    className: 'text-right w-[120px]',
  },
  {
    header: 'Success Rate',
    accessor: 'success_rate',
    cell: (row) => (
      <span
        className={cn(
          'tabular-nums',
          row.success_rate < 95 && 'text-destructive font-medium'
        )}
      >
        {formatPercent(row.success_rate)}
      </span>
    ),
    className: 'text-right w-[120px]',
  },
  {
    header: 'Avg Response Time',
    accessor: 'avg_response_time_ms',
    cell: (row) => (
      <span className="tabular-nums">{formatMs(row.avg_response_time_ms)}</span>
    ),
    className: 'text-right w-[150px]',
  },
]

function TopEndpointsTable({ data, isLoading }: TopEndpointsTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.total_requests - a.total_requests),
    [data]
  )

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, page, pageSize])

  // Reset page when data changes
  const dataLength = sortedData.length
  useMemo(() => { setPage(1) }, [dataLength])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Top Endpoints
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          pagination={
            sortedData.length > 0
              ? { page, pageSize, total: sortedData.length }
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

export { TopEndpointsTable }
export type { TopEndpointsTableProps }
