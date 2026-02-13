import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { AlertTable } from '../components/alert-table'
import { CreateAlertDialog } from '../components/create-alert-dialog'
import { AlertHistory } from '../components/alert-history'
import { useAlerts, useAlertHistory } from '../hooks'
import { useProjectContext } from '@/features/projects/project-context'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Alert } from '../types'

const DEFAULT_PAGE_SIZE = 20

export default function AlertsPage() {
  const { project } = useProjectContext()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAlerts(String(project.id), { page, page_size: DEFAULT_PAGE_SIZE })
  const alerts = data?.results ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.total_pages ?? 1

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | undefined>(undefined)
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const { data: history = [], isLoading: isHistoryLoading } = useAlertHistory(
    String(project.id),
    selectedAlert ? String(selectedAlert.id) : ''
  )

  function handleCreate() {
    setEditingAlert(undefined)
    setDialogOpen(true)
  }

  function handleEdit(alert: Alert) {
    setEditingAlert(alert)
    setDialogOpen(true)
  }

  function handleViewHistory(alert: Alert) {
    setSelectedAlert((prev) => (prev?.id === alert.id ? null : alert))
  }

  function handleCloseHistory() {
    setSelectedAlert(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alerts"
        description="Monitor your API metrics and get notified when thresholds are crossed."
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Create Alert
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <AlertTable
          alerts={alerts}
          isLoading={isLoading}
          onEdit={handleEdit}
          onViewHistory={handleViewHistory}
        />

        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              {(page - 1) * DEFAULT_PAGE_SIZE + 1} to{' '}
              {Math.min(page * DEFAULT_PAGE_SIZE, pagination.count)}{' '}
              of {pagination.count} alerts
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {selectedAlert && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                History: {selectedAlert.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Timeline of state changes for this alert.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCloseHistory}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close history</span>
            </Button>
          </div>
          <AlertHistory history={history} isLoading={isHistoryLoading} />
        </Card>
      )}

      <CreateAlertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        alert={editingAlert}
      />
    </div>
  )
}
