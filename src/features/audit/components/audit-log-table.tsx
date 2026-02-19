import { Fragment, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTable, getNestedValue } from '@/components/shared/data-table'
import { PaginationControls } from '@/components/shared/pagination-controls'
import { cn } from '@/lib/utils/cn'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Column, PaginationConfig } from '@/components/shared/data-table'
import type { AuditLog } from '../types'

const ACTION_BADGE_STYLES: Record<string, string> = {
  create: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  update: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  delete: 'bg-destructive/10 text-destructive',
  invite: 'bg-primary/10 text-primary',
  remove: 'bg-destructive/10 text-destructive',
  enable: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  disable: 'bg-muted/60 text-muted-foreground',
  view: 'bg-muted/60 text-muted-foreground',
  login: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  logout: 'bg-muted/60 text-muted-foreground',
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
  onPageSizeChange?: (pageSize: number) => void
  isLoading?: boolean
}

function AuditLogTable({
  logs,
  pagination,
  onPageChange,
  onPageSizeChange,
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
      <div className="w-full overflow-auto rounded-lg border border-border/50">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/40">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    'h-10 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
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
                  <tr className="border-b border-border/50 transition-colors hover:bg-muted/40">
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
                    <tr className="border-b border-border/50 bg-muted/20">
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

      {pagination && (
        <PaginationControls
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={(p) => onPageChange?.(p)}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  )
}

export { AuditLogTable }
export type { AuditLogTableProps }
