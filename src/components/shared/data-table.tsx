import { cn } from '@/lib/utils/cn'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { useReducedMotion } from '@/lib/animation'
import type { ReactNode } from 'react'

interface Column<T> {
  header: string
  accessor: keyof T | string
  cell?: (row: T, index: number) => ReactNode
  className?: string
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
  isLoading?: boolean
  className?: string
  rowKey?: (row: T) => string | number
}

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

function DataTable<T>({
  columns,
  data,
  pagination,
  onPageChange,
  isLoading = false,
  className,
  rowKey,
}: DataTableProps<T>) {
  const prefersReducedMotion = useReducedMotion()
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1

  const pageNumbers = pagination
    ? getPageNumbers(pagination.page, totalPages)
    : []

  const shouldAnimate = rowKey && !prefersReducedMotion

  if (isLoading) {
    return (
      <div className={cn('w-full overflow-auto', className)}>
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
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b">
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={cn('p-4 align-middle', col.className)}
                  >
                    <Skeleton className="h-4 w-[80%]" />
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
        </table>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No results found</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
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
            {shouldAnimate ? (
              <AnimatePresence mode="popLayout">
                {data.map((row, rowIdx) => (
                  <motion.tr
                    key={rowKey(row)}
                    className="border-b transition-all duration-150 hover:bg-muted/50 hover:shadow-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={cn('p-4 align-middle', col.className)}
                      >
                        {col.cell
                          ? col.cell(row, rowIdx)
                          : String(
                              getNestedValue(row, String(col.accessor)) ?? ''
                            )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowKey ? rowKey(row) : rowIdx}
                  className="border-b transition-all duration-150 hover:bg-muted/50 hover:shadow-sm"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={cn('p-4 align-middle', col.className)}
                    >
                      {col.cell
                        ? col.cell(row, rowIdx)
                        : String(
                            getNestedValue(row, String(col.accessor)) ?? ''
                          )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
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
            {pageNumbers.map((pageNum, idx) =>
              pageNum === -1 ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onPageChange?.(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page >= totalPages}
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

function getPageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: number[] = [1]

  if (current > 3) {
    pages.push(-1) // ellipsis
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push(-1) // ellipsis
  }

  pages.push(total)

  return pages
}

export { DataTable }
export type { Column, PaginationConfig, DataTableProps }
