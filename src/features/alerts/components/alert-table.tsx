import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { EmptyState } from '@/components/shared/empty-state'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { AlertStateBadge } from './alert-state-badge'
import { useUpdateAlert, useDeleteAlert } from '../hooks'
import { useProjectContext } from '@/features/projects/project-context'
import { formatRelativeTime } from '@/lib/utils/format'
import { Bell, Pencil, Trash2 } from 'lucide-react'
import type { Alert } from '../types'

interface AlertTableProps {
  alerts: Alert[]
  isLoading: boolean
  onEdit: (alert: Alert) => void
  onViewHistory: (alert: Alert) => void
}

function AlertTable({ alerts, isLoading, onEdit, onViewHistory }: AlertTableProps) {
  const { project } = useProjectContext()
  const updateAlert = useUpdateAlert()
  const deleteAlertMutation = useDeleteAlert()
  const [deleteTarget, setDeleteTarget] = useState<Alert | null>(null)

  function handleToggleEnabled(alert: Alert) {
    updateAlert.mutate({
      projectId: String(project.id),
      alertId: String(alert.id),
      data: { is_enabled: !alert.is_enabled },
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    deleteAlertMutation.mutate(
      { projectId: String(project.id), alertId: String(deleteTarget.id) },
      { onSuccess: () => setDeleteTarget(null) }
    )
  }

  if (isLoading) {
    return <TableSkeleton />
  }

  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No alerts configured"
        description="Create an alert to get notified when your API metrics cross a threshold."
      />
    )
  }

  return (
    <>
      <div className="w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead>
            <tr className="border-b">
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Metric
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Condition
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Window
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Enabled
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Last Triggered
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                onClick={() => onViewHistory(alert)}
              >
                <td className="p-4 align-middle font-medium">{alert.name}</td>
                <td className="p-4 align-middle">{alert.metric_display}</td>
                <td className="p-4 align-middle">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {alert.comparison_display} {alert.threshold}
                  </code>
                </td>
                <td className="p-4 align-middle">{alert.evaluation_window_minutes} min</td>
                <td className="p-4 align-middle">
                  <AlertStateBadge status={alert.status} />
                </td>
                <td className="p-4 align-middle">
                  <Switch
                    checked={alert.is_enabled}
                    onCheckedChange={() => handleToggleEnabled(alert)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={updateAlert.isPending}
                  />
                </td>
                <td className="p-4 align-middle text-muted-foreground">
                  {alert.last_triggered_at
                    ? formatRelativeTime(alert.last_triggered_at)
                    : 'Never'}
                </td>
                <td className="p-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(alert)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit alert</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(alert)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete alert</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete Alert"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteAlertMutation.isPending}
      />
    </>
  )
}

export { AlertTable }
export type { AlertTableProps }
