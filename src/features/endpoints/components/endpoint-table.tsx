import { useState } from 'react'
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
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'
import { useEndpoints, useDeleteEndpoint } from '../hooks'
import { BarChart3, Pencil, Trash2, Search, Unplug, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Endpoint } from '../types'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const
const DEFAULT_PAGE_SIZE = 20

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  PATCH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  HEAD: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  OPTIONS: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
}

interface EndpointTableProps {
  projectId: string
  onEdit: (endpoint: Endpoint) => void
}

function EndpointTable({ projectId, onEdit }: EndpointTableProps) {
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Endpoint | null>(null)

  const filters = {
    page,
    page_size: DEFAULT_PAGE_SIZE,
    ...(methodFilter !== 'all' ? { method: methodFilter } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
  }

  const { data, isLoading } = useEndpoints(projectId, filters)
  const deleteMutation = useDeleteEndpoint()

  const endpoints = data?.results ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.total_pages ?? 1

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

  if (isLoading && page === 1 && !search && methodFilter === 'all') {
    return <TableSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search endpoints..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select
          value={methodFilter}
          onValueChange={handleMethodChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All methods" />
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
      </div>

      {endpoints.length === 0 && !isLoading ? (
        <EmptyState
          icon={Unplug}
          title="No endpoints found"
          description={search || methodFilter !== 'all'
            ? 'No endpoints match your filters.'
            : 'No endpoints have been added yet.'}
        />
      ) : (
        <>
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">
                    Method
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Path
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px]">
                    Status
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[100px]">
                    Requests
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[120px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((row) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">
                      <Badge
                        variant="outline"
                        className={cn(
                          'border-0 font-mono text-xs font-bold',
                          METHOD_COLORS[row.method]
                        )}
                      >
                        {row.method}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-mono text-sm">{row.path}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="text-sm">{row.name || '\u2014'}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {row.description || '\u2014'}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant={row.is_active ? 'success' : 'secondary'}>
                        {row.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <span className="text-sm tabular-nums">
                        {formatNumber(row.request_count)}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
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
                          onClick={() => onEdit(row)}
                          title="Edit endpoint"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(row)}
                          title="Delete endpoint"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                {(page - 1) * DEFAULT_PAGE_SIZE + 1} to{' '}
                {Math.min(page * DEFAULT_PAGE_SIZE, pagination.count)}{' '}
                of {pagination.count} results
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous page</span>
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </div>
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
