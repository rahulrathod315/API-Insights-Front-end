import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DataTable } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/badge'
import { ArrowUpFromLine, ArrowDownToLine, Database } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { Column } from '@/components/shared/data-table'
import type { EndpointStats } from '../types'

interface EndpointSizeBreakdownProps {
  endpoints: EndpointStats[]
  isLoading: boolean
}

interface EndpointWithSizes extends EndpointStats {
  avgRequestSize: number
  avgResponseSize: number
  totalSize: number
  sizeRatio: number
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function getSizeBadge(bytes: number): { variant: 'default' | 'secondary' | 'destructive'; label: string } {
  const mb = bytes / (1024 * 1024)
  if (mb < 0.1) return { variant: 'default', label: 'Small' }
  if (mb < 1) return { variant: 'secondary', label: 'Medium' }
  return { variant: 'destructive', label: 'Large' }
}

export function EndpointSizeBreakdown({ endpoints, isLoading }: EndpointSizeBreakdownProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const processedEndpoints = useMemo(() => {
    return endpoints.map((endpoint) => {
      // Calculate average sizes (assuming total_request_size_bytes and total_response_size_bytes from backend)
      // For now, use placeholder calculations based on request count
      const avgReqSize = endpoint.total_requests > 0 ? 512 : 0 // Placeholder
      const avgResSize = endpoint.total_requests > 0 ? 1024 : 0 // Placeholder

      return {
        ...endpoint,
        avgRequestSize: avgReqSize,
        avgResponseSize: avgResSize,
        totalSize: avgReqSize + avgResSize,
        sizeRatio: avgReqSize > 0 ? avgResSize / avgReqSize : 0,
      }
    }).sort((a, b) => b.totalSize - a.totalSize)
  }, [endpoints])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return processedEndpoints.slice(start, start + pageSize)
  }, [processedEndpoints, page, pageSize])

  const totalStats = useMemo(() => {
    const total = processedEndpoints.reduce(
      (acc, ep) => ({
        totalRequests: acc.totalRequests + ep.total_requests,
        totalRequestBytes: acc.totalRequestBytes + ep.avgRequestSize * ep.total_requests,
        totalResponseBytes: acc.totalResponseBytes + ep.avgResponseSize * ep.total_requests,
      }),
      { totalRequests: 0, totalRequestBytes: 0, totalResponseBytes: 0 }
    )

    return {
      ...total,
      avgRequestSize: total.totalRequests > 0 ? total.totalRequestBytes / total.totalRequests : 0,
      avgResponseSize: total.totalRequests > 0 ? total.totalResponseBytes / total.totalRequests : 0,
      totalBandwidth: total.totalRequestBytes + total.totalResponseBytes,
    }
  }, [processedEndpoints])

  const columns = useMemo<Column<EndpointWithSizes>[]>(
    () => [
      {
        header: 'Endpoint',
        accessor: 'path',
        cell: (row) => (
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {row.method}
              </Badge>
              <span className="font-mono text-sm">{row.path}</span>
            </div>
            {row.name && (
              <p className="mt-1 text-xs text-muted-foreground">{row.name}</p>
            )}
          </div>
        ),
      },
      {
        header: 'Avg Request',
        accessor: 'avgRequestSize',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <ArrowUpFromLine className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium tabular-nums">
              {formatBytes(row.avgRequestSize)}
            </span>
          </div>
        ),
        className: 'w-[140px]',
      },
      {
        header: 'Avg Response',
        accessor: 'avgResponseSize',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium tabular-nums">
              {formatBytes(row.avgResponseSize)}
            </span>
          </div>
        ),
        className: 'w-[140px]',
      },
      {
        header: 'Total Size',
        accessor: 'totalSize',
        cell: (row) => {
          const badge = getSizeBadge(row.totalSize)
          return (
            <div className="flex items-center gap-2">
              <span className="font-semibold tabular-nums">
                {formatBytes(row.totalSize)}
              </span>
              <Badge variant={badge.variant} className="text-xs">
                {badge.label}
              </Badge>
            </div>
          )
        },
        className: 'w-[160px]',
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
        header: 'Total Bandwidth',
        accessor: 'totalSize',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-semibold tabular-nums">
              {formatBytes(row.totalSize * row.total_requests)}
            </span>
          </div>
        ),
        className: 'w-[160px]',
      },
    ],
    []
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Endpoint Size Breakdown
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Payload sizes by endpoint, sorted by total size
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowUpFromLine className="h-4 w-4" />
                <span className="text-xs">Avg Request</span>
              </div>
              <p className="mt-1 text-xl font-bold">
                {formatBytes(totalStats.avgRequestSize)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ArrowDownToLine className="h-4 w-4" />
                <span className="text-xs">Avg Response</span>
              </div>
              <p className="mt-1 text-xl font-bold">
                {formatBytes(totalStats.avgResponseSize)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="h-4 w-4" />
                <span className="text-xs">Total Bandwidth</span>
              </div>
              <p className="mt-1 text-xl font-bold">
                {formatBytes(totalStats.totalBandwidth)}
              </p>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={paginatedData}
            isLoading={isLoading}
            pagination={
              processedEndpoints.length > 0
                ? { page, pageSize, total: processedEndpoints.length }
                : undefined
            }
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            rowKey={(row) => String(row.id)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
