import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/shared/page-header'
import { AlertTable } from '../components/alert-table'
import { CreateAlertDialog } from '../components/create-alert-dialog'
import { EnhancedAlertHistory } from '../components/enhanced-alert-history'
import { AlertAnalyticsDashboard } from '../components/alert-analytics-dashboard'
import { DataFreshnessIndicator } from '@/features/analytics/components/data-freshness-indicator'
import { useAlerts, useAlertHistory } from '../hooks'
import { useProjectContext } from '@/features/projects/project-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Alert } from '../types'

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export default function AlertsPage() {
  const { project } = useProjectContext()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data, isLoading, refetch, dataUpdatedAt, isFetching } = useAlerts(String(project.id), { page, page_size: pageSize })
  const alerts = data?.results ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.total_pages ?? 1

  // Fetch all alerts for analytics (without pagination)
  const { data: allAlertsData } = useAlerts(String(project.id), { page: 1, page_size: 1000 })
  const allAlerts = allAlertsData?.results ?? []

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
          <div className="flex flex-wrap items-center gap-3">
            <DataFreshnessIndicator
              isFetching={isFetching}
              dataUpdatedAt={dataUpdatedAt}
              onRefresh={refetch}
            />
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4" />
              Create Alert
            </Button>
          </div>
        }
      />

      {/* Analytics Dashboard */}
      {allAlerts.length > 0 && (
        <AlertAnalyticsDashboard alerts={allAlerts} isLoading={isLoading} />
      )}

      <Card className="overflow-hidden">
        <AlertTable
          alerts={alerts}
          isLoading={isLoading}
          onEdit={handleEdit}
          onViewHistory={handleViewHistory}
        />

        {pagination && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, pagination.count)}{' '}
                of {pagination.count} alerts
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => { setPageSize(Number(value)); setPage(1) }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {totalPages > 1 && (
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
            )}
          </div>
        )}
      </Card>

      {selectedAlert && (
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Alert History: {selectedAlert.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Detailed analytics and timeline of events for this alert.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCloseHistory}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close history</span>
            </Button>
          </div>
          <EnhancedAlertHistory
            alert={selectedAlert}
            history={history}
            isLoading={isHistoryLoading}
          />
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
