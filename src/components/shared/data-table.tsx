import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { PaginationControls } from '@/components/shared/pagination-controls'
import { Inbox } from 'lucide-react'
import { useReducedMotion } from '@/lib/animation'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface Column<T> {
  header: string
  accessor: keyof T | string
  cell?: (row: T, index: number) => ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

interface PaginationConfig {
  page: number
  pageSize: number
  total: number
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  pagination?: PaginationConfig
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  isLoading?: boolean
  className?: string
  rowKey?: (row: T) => string | number
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string
  emptyIcon?: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
  stickyHeader?: boolean
}

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

function TableHead<T>({ columns, stickyHeader }: { columns: Column<T>[]; stickyHeader?: boolean }) {
  return (
    <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
      <tr className="border-b border-border bg-muted/40">
        {columns.map((col, i) => (
          <th
            key={i}
            className={cn(
              'h-10 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground',
              col.headerClassName ?? col.className
            )}
          >
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function DataTable<T>({
  columns,
  data,
  pagination,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  className,
  rowKey,
  onRowClick,
  rowClassName,
  emptyIcon: EmptyIcon = Inbox,
  emptyTitle = 'No results found',
  emptyDescription,
  stickyHeader = false,
}: DataTableProps<T>) {
  const prefersReducedMotion = useReducedMotion()
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1
  const shouldAnimate = Boolean(rowKey) && !prefersReducedMotion

  if (isLoading) {
    return (
      <div className={cn('w-full overflow-auto', className)}>
        <table className="w-full caption-bottom text-sm">
          <TableHead columns={columns} stickyHeader={stickyHeader} />
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b border-border/50">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={cn('px-4 py-3 align-middle', col.className)}>
                    <Skeleton className="h-4 rounded-md" style={{ width: `${60 + (colIdx * 13) % 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('w-full overflow-auto', className)}>
        <table className="w-full caption-bottom text-sm">
          <TableHead columns={columns} stickyHeader={stickyHeader} />
        </table>
        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60">
            <EmptyIcon className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
          {emptyDescription && (
            <p className="max-w-xs text-xs text-muted-foreground">{emptyDescription}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <TableHead columns={columns} stickyHeader={stickyHeader} />
          <tbody>
            {shouldAnimate ? (
              <AnimatePresence mode="popLayout">
                {data.map((row, rowIdx) => (
                  <motion.tr
                    key={rowKey!(row)}
                    className={cn(
                      'border-b border-border/50 transition-colors duration-100',
                      'hover:bg-muted/40',
                      onRowClick && 'cursor-pointer',
                      rowClassName?.(row)
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.12 }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={cn('px-4 py-3 align-middle', col.className)}>
                        {col.cell
                          ? col.cell(row, rowIdx)
                          : String(getNestedValue(row, String(col.accessor)) ?? '')}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowKey ? rowKey(row) : rowIdx}
                  className={cn(
                    'border-b border-border/50 transition-colors duration-100',
                    'hover:bg-muted/40',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row)
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={cn('px-4 py-3 align-middle', col.className)}>
                      {col.cell
                        ? col.cell(row, rowIdx)
                        : String(getNestedValue(row, String(col.accessor)) ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (totalPages > 1 || onPageSizeChange) && (
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

export { DataTable, getNestedValue }
export type { Column, PaginationConfig, DataTableProps }
