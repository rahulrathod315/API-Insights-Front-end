import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/shared/status-badge'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber } from '@/lib/utils/format'
import type { ErrorClustersResponse } from '../types'

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
          {/* By Status Code */}
          {data.by_status_code.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">By Status Code</p>
              {data.by_status_code.map((item, index) => (
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
            </div>
          )}

          {/* By Endpoint */}
          {data.by_endpoint.length > 0 && (
            <div className="space-y-2">
              <Separator className="my-2" />
              <p className="text-xs font-medium text-muted-foreground uppercase">By Endpoint</p>
              {data.by_endpoint.map((item) => (
                <div key={item.endpoint_id} className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {item.method} {item.path}
                  </Badge>
                  <span className="text-sm tabular-nums">
                    {formatNumber(item.error_count)} errors (4xx: {formatNumber(item.status_4xx)}, 5xx: {formatNumber(item.status_5xx)})
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Common Error Messages */}
          {data.common_error_messages.length > 0 && (
            <div className="space-y-2">
              <Separator className="my-2" />
              <p className="text-xs font-medium text-muted-foreground uppercase">Common Messages</p>
              {data.common_error_messages.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">{item.error_message}</span>
                  <Badge variant="secondary">
                    {formatNumber(item.count)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { ErrorClusters }
export type { ErrorClustersProps }
