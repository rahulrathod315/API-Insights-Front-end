import { Fragment, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTable } from '@/components/shared/data-table'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Column, PaginationConfig } from '@/components/shared/data-table'
import type { AuditLog } from '../types'

const ACTION_BADGE_STYLES: Record<string, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  invite: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  remove: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  enable: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
  disable: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
}

function getActionBadgeClass(action: string): string {
  return ACTION_BADGE_STYLES[action] ?? 'bg-secondary text-secondary-foreground'
}

function ChangesDetail({ changes }: { changes: AuditLog['changes'] }) {
  if (!changes || Object.keys(changes).length === 0) {
    return (
      <span className="text-sm text-muted-foreground">No changes recorded</span>
    )
  }

  return (
    <div className="space-y-2 py-2">
      {Object.entries(changes).map(([field, value]) => (
        <div key={field} className="grid grid-cols-[120px_1fr] gap-2 text-sm">
          <span className="font-medium text-muted-foreground">{field}</span>
          <div className="rounded bg-muted px-2 py-1">
            <span className="text-foreground">
              {String(value ?? '(empty)')}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

interface AuditLogTableProps {
  logs: AuditLog[]
  pagination?: PaginationConfig
  onPageChange?: (page: number) => void
  isLoading?: boolean
}

function AuditLogTable({
  logs,
  pagination,
  onPageChange,
  isLoading = false,
}: AuditLogTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  function toggleRow(id: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const columns: Column<AuditLog>[] = [
    {
      header: '',
      accessor: 'id',
      className: 'w-10',
      cell: (row) => {
        const hasChanges = row.changes && Object.keys(row.changes).length > 0
        if (!hasChanges) return null
        const isExpanded = expandedRows.has(row.id)
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => toggleRow(row.id)}
            aria-label={isExpanded ? 'Collapse changes' : 'Expand changes'}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )
      },
    },
    {
      header: 'Actor',
      accessor: 'actor_email',
      cell: (row) => (
        <div>
          <p className="font-medium">{row.actor_email}</p>
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      cell: (row) => (
        <Badge
          variant="outline"
          className={cn('border-none capitalize', getActionBadgeClass(row.action))}
        >
          {row.action}
        </Badge>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.description || '\u2014'}
        </span>
      ),
    },
    {
      header: 'Resource',
      accessor: 'resource_type',
      cell: (row) => (
        <div>
          <p className="font-medium capitalize">{row.resource_type}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {row.resource_id}
          </p>
        </div>
      ),
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      cell: (row) => (
        <span className="font-mono text-sm">{row.ip_address}</span>
      ),
    },
    {
      header: 'Time',
      accessor: 'created_at',
      cell: (row) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-sm text-muted-foreground">
                {formatRelativeTime(row.created_at)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{formatDateTime(row.created_at)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
  ]

  if (isLoading || logs.length === 0) {
    return (
      <DataTable<AuditLog>
        columns={columns}
        data={logs}
        pagination={pagination}
        onPageChange={onPageChange}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className="w-full">
      <div className="w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const isExpanded = expandedRows.has(log.id)
              const hasChanges = log.changes && Object.keys(log.changes).length > 0

              return (
                <Fragment key={log.id}>
                  <tr className="border-b transition-colors hover:bg-muted/50">
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={cn('p-4 align-middle', col.className)}
                      >
                        {col.cell
                          ? col.cell(log, 0)
                          : String(
                              getNestedValue(log, String(col.accessor)) ?? ''
                            )}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && hasChanges && (
                    <tr className="border-b bg-muted/30">
                      <td />
                      <td colSpan={columns.length - 1} className="px-4 py-3">
                        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Changes
                        </div>
                        <ChangesDetail changes={log.changes} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && Math.ceil(pagination.total / pagination.pageSize) > 1 && (
        <div className="flex items-center justify-between px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)}{' '}
            of {pagination.total} results
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={
                pagination.page >= Math.ceil(pagination.total / pagination.pageSize)
              }
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

export { AuditLogTable }
export type { AuditLogTableProps }
