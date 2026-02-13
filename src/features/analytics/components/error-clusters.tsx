import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/shared/status-badge'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'
import type { ErrorClustersResponse } from '../types'

const CLUSTER_PAGE_SIZE = 5

interface ErrorClustersProps {
  data: ErrorClustersResponse | undefined
  isLoading: boolean
}

function ErrorClusters({ data, isLoading }: ErrorClustersProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Error Clusters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!data || data.total_errors === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Error Clusters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">
            No error clusters found
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorClustersContent data={data} />
  )
}

function MiniPagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-end gap-1 pt-2">
      <span className="mr-2 text-xs text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  )
}

function ErrorClustersContent({ data }: { data: ErrorClustersResponse }) {
  const [statusPage, setStatusPage] = useState(1)
  const [endpointPage, setEndpointPage] = useState(1)
  const [messagePage, setMessagePage] = useState(1)

  const statusCodes = data.by_status_code
  const statusTotalPages = Math.ceil(statusCodes.length / CLUSTER_PAGE_SIZE)
  const pagedStatusCodes = useMemo(
    () => statusCodes.slice((statusPage - 1) * CLUSTER_PAGE_SIZE, statusPage * CLUSTER_PAGE_SIZE),
    [statusCodes, statusPage]
  )

  const endpoints = data.by_endpoint
  const endpointTotalPages = Math.ceil(endpoints.length / CLUSTER_PAGE_SIZE)
  const pagedEndpoints = useMemo(
    () => endpoints.slice((endpointPage - 1) * CLUSTER_PAGE_SIZE, endpointPage * CLUSTER_PAGE_SIZE),
    [endpoints, endpointPage]
  )

  const messages = data.common_error_messages
  const messageTotalPages = Math.ceil(messages.length / CLUSTER_PAGE_SIZE)
  const pagedMessages = useMemo(
    () => messages.slice((messagePage - 1) * CLUSTER_PAGE_SIZE, messagePage * CLUSTER_PAGE_SIZE),
    [messages, messagePage]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Error Clusters
          <Badge variant="secondary" className="ml-2">
            {formatNumber(data.total_errors)} total errors
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusCodes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">By Status Code</p>
              {pagedStatusCodes.map((item, index) => (
                <div key={item.status_code}>
                  {index > 0 && <Separator className="mb-2" />}
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge code={item.status_code} />
                    <Badge variant="secondary">
                      {formatNumber(item.count)} occurrences
                    </Badge>
                  </div>
                </div>
              ))}
              <MiniPagination page={statusPage} totalPages={statusTotalPages} onPageChange={setStatusPage} />
            </div>
          )}

          {endpoints.length > 0 && (
            <div className="space-y-2">
              <Separator className="my-2" />
              <p className="text-xs font-medium text-muted-foreground uppercase">By Endpoint</p>
              {pagedEndpoints.map((item) => (
                <div key={item.endpoint_id} className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {item.method} {item.path}
                  </Badge>
                  <span className="text-sm tabular-nums">
                    {formatNumber(item.error_count)} errors (4xx: {formatNumber(item.status_4xx)}, 5xx: {formatNumber(item.status_5xx)})
                  </span>
                </div>
              ))}
              <MiniPagination page={endpointPage} totalPages={endpointTotalPages} onPageChange={setEndpointPage} />
            </div>
          )}

          {messages.length > 0 && (
            <div className="space-y-2">
              <Separator className="my-2" />
              <p className="text-xs font-medium text-muted-foreground uppercase">Common Messages</p>
              {pagedMessages.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{item.error_message}</span>
                  <Badge variant="secondary">
                    {formatNumber(item.count)}
                  </Badge>
                </div>
              ))}
              <MiniPagination page={messagePage} totalPages={messageTotalPages} onPageChange={setMessagePage} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { ErrorClusters }
export type { ErrorClustersProps }
