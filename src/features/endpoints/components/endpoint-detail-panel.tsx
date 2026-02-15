import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils/cn'
import { formatDate, formatNumber } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import {
  X,
  BarChart3,
  Pencil,
  Trash2,
  Activity,
} from 'lucide-react'
import { useProjectContext } from '@/features/projects/project-context'
import type { Endpoint } from '../types'

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-primary/10 text-primary',
  POST: 'bg-primary/15 text-primary',
  PUT: 'bg-primary/10 text-primary',
  PATCH: 'bg-primary/10 text-primary',
  DELETE: 'bg-primary/10 text-primary',
  HEAD: 'bg-primary/10 text-primary',
  OPTIONS: 'bg-muted text-muted-foreground',
}

interface EndpointDetailPanelProps {
  endpoint: Endpoint
  onClose: () => void
  onEdit: (endpoint: Endpoint) => void
  onDelete: (endpoint: Endpoint) => void
}

function EndpointDetailPanel({
  endpoint,
  onClose,
  onEdit,
  onDelete,
}: EndpointDetailPanelProps) {
  const { project } = useProjectContext()
  const tz = useTimezone()

  return (
    <div className="flex h-full flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-lg font-semibold">Endpoint Details</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close panel</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Method + Path */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  'border-0 font-mono text-xs font-bold',
                  METHOD_COLORS[endpoint.method]
                )}
              >
                {endpoint.method}
              </Badge>
              <span className="font-mono text-sm font-medium">
                {endpoint.path}
              </span>
            </div>
            {endpoint.description && (
              <p className="text-sm text-muted-foreground">
                {endpoint.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Status + Dates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={endpoint.is_active ? 'success' : 'secondary'}>
                {endpoint.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{formatDate(endpoint.created_at, tz)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Updated</span>
              <span className="text-sm">{formatDate(endpoint.updated_at, tz)}</span>
            </div>
          </div>

          <Separator />

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Requests
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">
                  {formatNumber(endpoint.request_count)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link
                to={`/projects/${project.id}/analytics/endpoints/${endpoint.id}`}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => onEdit(endpoint)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Endpoint
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-primary hover:text-primary"
              onClick={() => onDelete(endpoint)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Endpoint
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { EndpointDetailPanel }
export type { EndpointDetailPanelProps }
