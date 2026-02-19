import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { DataTable } from '@/components/shared/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { AlertStateBadge } from './alert-state-badge'
import { AlertHealthBadge } from './alert-health-badge'
import { useUpdateAlert, useDeleteAlert } from '../hooks'
import { useProjectContext } from '@/features/projects/project-context'
import { formatRelativeTime } from '@/lib/utils/format'
import { Bell, Pencil, Trash2 } from 'lucide-react'
import type { Column } from '@/components/shared/data-table'
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

  const columns: Column<Alert>[] = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (alert) => (
        <div>
          <div className="font-medium">{alert.name}</div>
          {alert.description && (
            <div className="text-xs text-muted-foreground">{alert.description}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Metric',
      accessor: 'metric_display',
    },
    {
      header: 'Condition',
      accessor: 'threshold',
      cell: (alert) => (
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          {alert.comparison_display} {alert.threshold}
        </code>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (alert) => <AlertStateBadge status={alert.status} />,
    },
    {
      header: 'Health Score',
      accessor: 'health_score',
      cell: (alert) => (
        <div onClick={(e) => e.stopPropagation()}>
          <AlertHealthBadge alert={alert} />
        </div>
      ),
    },
    {
      header: 'Enabled',
      accessor: 'is_enabled',
      cell: (alert) => (
        <Switch
          checked={alert.is_enabled}
          onCheckedChange={() => handleToggleEnabled(alert)}
          onClick={(e) => e.stopPropagation()}
          disabled={updateAlert.isPending}
        />
      ),
    },
    {
      header: 'Last Triggered',
      accessor: 'last_triggered_at',
      cell: (alert) => (
        <span className="text-muted-foreground">
          {alert.last_triggered_at
            ? formatRelativeTime(alert.last_triggered_at)
            : 'Never'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      className: 'text-right',
      cell: (alert) => (
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
      ),
    },
  ]

  return (
    <>
      <DataTable<Alert>
        columns={columns}
        data={alerts}
        isLoading={isLoading}
        rowKey={(a) => a.id}
        onRowClick={onViewHistory}
        emptyIcon={Bell}
        emptyTitle="No alerts configured"
        emptyDescription="Create an alert to get notified when your API metrics cross a threshold."
      />

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
