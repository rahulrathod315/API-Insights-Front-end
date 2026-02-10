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
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { cn } from '@/lib/utils/cn'
import { formatNumber } from '@/lib/utils/format'
import { useEndpoints, useDeleteEndpoint } from '../hooks'
import { BarChart3, Pencil, Trash2, Search, Unplug } from 'lucide-react'
import type { Endpoint } from '../types'

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const

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
  const [deleteTarget, setDeleteTarget] = useState<Endpoint | null>(null)

  const { data: allEndpoints = [], isLoading } = useEndpoints(projectId)
  const deleteMutation = useDeleteEndpoint()

  const endpoints = useMemo(() => {
    let filtered = allEndpoints

    if (methodFilter !== 'all') {
      filtered = filtered.filter((ep) => ep.method === methodFilter)
    }

    if (search.trim()) {
      const query = search.toLowerCase()
      filtered = filtered.filter(
        (ep) =>
          ep.path.toLowerCase().includes(query) ||
          ep.name.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [allEndpoints, methodFilter, search])

  function handleDelete() {
    if (!deleteTarget) return
    deleteMutation.mutate(
      { projectId, endpointId: String(deleteTarget.id) },
      { onSuccess: () => setDeleteTarget(null) }
    )
  }

  if (isLoading) {
    return <TableSkeleton />
  }

  if (allEndpoints.length === 0) {
    return (
      <EmptyState
        icon={Unplug}
        title="No endpoints found"
        description="No endpoints have been added yet."
      />
    )
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
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={methodFilter}
          onValueChange={setMethodFilter}
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
