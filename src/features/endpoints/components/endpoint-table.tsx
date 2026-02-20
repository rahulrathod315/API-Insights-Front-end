import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaginationControls } from '@/components/shared/pagination-controls'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { cn } from '@/lib/utils/cn'
import { formatNumber, formatMs } from '@/lib/utils/format'
import { useEndpoints, useDeleteEndpoint } from '../hooks'
import { BarChart3, Pencil, Trash2, Search, Unplug, CheckCircle2, Power } from 'lucide-react'
import type { Endpoint } from '../types'
import type { EndpointStats } from '@/features/analytics/types'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const
const DEFAULT_PAGE_SIZE = 10

const METHOD_STYLES: Record<string, string> = {
  GET: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  POST: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
  PUT: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400',
  PATCH: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  DELETE: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400',
  HEAD: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400',
  OPTIONS: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400',
}

interface EndpointTableProps {
  projectId: string
  onEdit: (endpoint: Endpoint) => void
  onSelect?: (endpoint: Endpoint) => void
  endpointStats?: EndpointStats[]
}

function EndpointTable({ projectId, onEdit, onSelect, endpointStats = [] }: EndpointTableProps) {
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [performanceFilter, setPerformanceFilter] = useState<string>('all')
  const [errorRateFilter, setErrorRateFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [deleteTarget, setDeleteTarget] = useState<Endpoint | null>(null)

  const filters = {
    page,
    page_size: pageSize,
    ...(methodFilter !== 'all' ? { method: methodFilter } : {}),
    ...(statusFilter === 'active' ? { is_active: true } : statusFilter === 'inactive' ? { is_active: false } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  }

  const { data, isLoading } = useEndpoints(projectId, filters)
  const deleteMutation = useDeleteEndpoint()

  const endpoints = data?.results ?? []
  const pagination = data?.pagination

  // Create a map of endpoint stats by ID for quick lookup
  const statsMap = useMemo(() => {
    return new Map(endpointStats.map((stat) => [stat.id, stat]))
  }, [endpointStats])

  // Helper to get stats for an endpoint
  const getStats = (endpointId: number) => statsMap.get(endpointId)

  // Client-side filtering for all filters to ensure robustness
  const filteredEndpoints = useMemo(() => {
    let result = [...endpoints]

    // Filter by search query
    if (search.trim()) {
      const query = search.toLowerCase().trim()
      result = result.filter(
        (endpoint) =>
          endpoint.path.toLowerCase().includes(query) ||
          endpoint.name?.toLowerCase().includes(query)
      )
    }

    // Filter by HTTP method
    if (methodFilter !== 'all') {
      result = result.filter((endpoint) => endpoint.method === methodFilter)
    }

    // Filter by status (active/inactive)
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      result = result.filter((endpoint) => endpoint.is_active === isActive)
    }

    // Filter by performance tier
    if (performanceFilter !== 'all') {
      result = result.filter((endpoint) => {
        const stats = getStats(endpoint.id)
        if (!stats || stats.total_requests === 0) return false
        const avgResponse = stats.avg_response_time_ms

        if (performanceFilter === 'fast') return avgResponse < 200
        if (performanceFilter === 'normal') return avgResponse >= 200 && avgResponse < 500
        if (performanceFilter === 'slow') return avgResponse >= 500
        return true
      })
    }

    // Filter by error rate
    if (errorRateFilter !== 'all') {
      result = result.filter((endpoint) => {
        const stats = getStats(endpoint.id)
        if (!stats || stats.total_requests === 0) return false
        const errorRate = (stats.error_count / stats.total_requests) * 100

        if (errorRateFilter === 'healthy') return errorRate < 5
        if (errorRateFilter === 'warning') return errorRate >= 5 && errorRate < 10
        if (errorRateFilter === 'critical') return errorRate >= 10
        return true
      })
    }

    return result
  }, [endpoints, search, methodFilter, statusFilter, performanceFilter, errorRateFilter, statsMap])

  function handleDelete() {
    if (!deleteTarget) return
    deleteMutation.mutate(
      { projectId, endpointId: String(deleteTarget.id) },
      { onSuccess: () => setDeleteTarget(null) }
    )
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleMethodChange(value: string) {
    setMethodFilter(value)
    setPage(1)
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  function handlePerformanceChange(value: string) {
    setPerformanceFilter(value)
    setPage(1)
  }

  function handleErrorRateChange(value: string) {
    setErrorRateFilter(value)
    setPage(1)
  }

  function handlePageSizeChange(value: string) {
    setPageSize(Number(value))
    setPage(1)
  }

  if (isLoading && page === 1 && !search && methodFilter === 'all') {
    return <TableSkeleton />
  }

  const hasActiveFilters =
    search.trim() !== '' ||
    methodFilter !== 'all' ||
    statusFilter !== 'all' ||
    performanceFilter !== 'all' ||
    errorRateFilter !== 'all'

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search endpoints..."
            className="pl-9 transition-colors focus-visible:border-primary focus-visible:ring-0"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select value={methodFilter} onValueChange={handleMethodChange}>
          <SelectTrigger className="w-[130px] transition-colors focus:border-primary focus:ring-0">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {HTTP_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[130px] transition-colors focus:border-primary focus:ring-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={performanceFilter} onValueChange={handlePerformanceChange}>
          <SelectTrigger className="w-[140px] transition-colors focus:border-primary focus:ring-0">
            <SelectValue placeholder="Performance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All speeds</SelectItem>
            <SelectItem value="fast">Fast (&lt;200ms)</SelectItem>
            <SelectItem value="normal">Normal (200-500ms)</SelectItem>
            <SelectItem value="slow">Slow (&gt;500ms)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={errorRateFilter} onValueChange={handleErrorRateChange}>
          <SelectTrigger className="w-[150px] transition-colors focus:border-primary focus:ring-0">
            <SelectValue placeholder="Error Rate" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All error rates</SelectItem>
            <SelectItem value="healthy">Healthy (&lt;5%)</SelectItem>
            <SelectItem value="warning">Warning (5-10%)</SelectItem>
            <SelectItem value="critical">Critical (&gt;10%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredEndpoints.length === 0 && !isLoading ? (
        <EmptyState
          icon={Unplug}
          title="No endpoints found"
          description={hasActiveFilters
            ? 'No endpoints match your filters. Try adjusting your filter criteria.'
            : 'No endpoints have been added yet.'}
        />
      ) : (
        <>
          <div className="w-full overflow-auto rounded-xl border border-border/40 shadow-sm">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="h-11 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 w-[80px]">
                    Method
                  </th>
                  <th className="h-11 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    Endpoint Path
                  </th>
                  <th className="h-11 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 w-[100px]">
                    Status
                  </th>
                  <th className="h-11 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 w-[140px]">
                    Avg Latency
                  </th>
                  <th className="h-11 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 w-[100px]">
                    Error Rate
                  </th>
                  <th className="h-11 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 w-[100px]">
                    P95
                  </th>
                  <th className="h-11 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 w-[100px]">
                    Traffic
                  </th>
                  <th className="h-11 px-4 text-right align-middle text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEndpoints.map((row) => {
                  const stats = getStats(row.id)
                  const errorRate = stats ? ((stats.error_count / stats.total_requests) * 100) : 0

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        'border-b border-border/50 transition-colors hover:bg-muted/40',
                        onSelect && 'cursor-pointer'
                      )}
                      onClick={() => onSelect?.(row)}
                    >
                      <td className="p-4 align-middle">
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0',
                            METHOD_STYLES[row.method]
                          )}
                        >
                          {row.method}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm tracking-tight">{row.path}</span>
                          {row.name && (
                            <span className="text-[11px] text-muted-foreground font-medium">{row.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge 
                          variant={row.is_active ? "success" : "secondary"}
                          className="gap-1.5 px-2 py-0.5"
                        >
                          {row.is_active ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Power className="h-3 w-3" />
                          )}
                          <span className="capitalize">{row.is_active ? 'Active' : 'Inactive'}</span>
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        {stats ? (
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            {formatMs(stats.avg_response_time_ms)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        {stats ? (
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            {errorRate.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        {stats ? (
                          <span className="text-sm font-medium tabular-nums text-muted-foreground">
                            {formatMs(stats.avg_response_time_ms)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4 align-middle text-left">
                        <span className="text-sm font-bold tabular-nums text-foreground/80">
                          {formatNumber(stats?.total_requests ?? row.request_count)}
                        </span>
                      </td>
                      {/* 7d Trend column removed — restore when time-series API is available */}
                      <td className="p-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link
                              to={`/projects/${projectId}/analytics/endpoints/${row.id}`}
                              title="View analytics"
                            >
                              <BarChart3 className="h-4 w-4" />
                              <span className="sr-only">View analytics</span>
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEdit(row)
                            }}
                            title="Edit endpoint"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget(row)
                            }}
                            title="Delete endpoint"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {pagination && (
            <PaginationControls
              page={page}
              pageSize={pageSize}
              total={pagination.count}
              onPageChange={setPage}
              onPageSizeChange={(size) => handlePageSizeChange(String(size))}
              className="py-2"
            />
          )}
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete Endpoint"
        description={`Are you sure you want to delete ${deleteTarget?.method} ${deleteTarget?.path}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

export { EndpointTable }
export type { EndpointTableProps }
