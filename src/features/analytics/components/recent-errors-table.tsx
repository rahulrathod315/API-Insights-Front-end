import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { formatFullDateTime } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { AlertCircle, Globe, Clock, Copy, Check } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Column } from '@/components/shared/data-table'

interface RecentError {
  id: number
  status_code: number
  error_message: string
  timestamp: string
  ip_address: string
}

interface RecentErrorsTableProps {
  data: RecentError[]
  isLoading: boolean
}

function getStatusColor(statusCode: number): 'destructive' | 'secondary' | 'default' {
  if (statusCode >= 500) return 'destructive'
  if (statusCode >= 400) return 'secondary'
  return 'default'
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function RecentErrorsTable({ data, isLoading }: RecentErrorsTableProps) {
  const tz = useTimezone()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  const columns = useMemo<Column<RecentError>[]>(
    () => [
      {
        header: 'Status',
        accessor: 'status_code',
        cell: (row) => (
          <Badge variant={getStatusColor(row.status_code)} className="font-mono">
            {row.status_code}
          </Badge>
        ),
        className: 'w-[100px]',
      },
      {
        header: 'Error Message',
        accessor: 'error_message',
        cell: (row) => (
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="line-clamp-2 text-sm font-medium">{row.error_message || 'No message'}</p>
            </div>
            <CopyButton text={row.error_message} />
          </div>
        ),
      },
      {
        header: 'IP Address',
        accessor: 'ip_address',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-sm">{row.ip_address}</span>
            <CopyButton text={row.ip_address} />
          </div>
        ),
        className: 'w-[200px]',
      },
      {
        header: 'Timestamp',
        accessor: 'timestamp',
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm tabular-nums text-muted-foreground">
              {formatFullDateTime(row.timestamp, tz)}
            </span>
          </div>
        ),
        className: 'w-[220px]',
      },
    ],
    [tz]
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Errors</CardTitle>
          {!isLoading && data.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Last {data.length} errors
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 && !isLoading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No recent errors found - your API is running smoothly!
            </p>
          </div>
        ) : (
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
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
            rowKey={(row) => String(row.id)}
          />
        )}
      </CardContent>
    </Card>
  )
}
