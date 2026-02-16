import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useProjectContext } from '@/features/projects/project-context'
import { useEndpoints, useDeleteEndpoint } from '../hooks'
import { EndpointTable } from '../components/endpoint-table'
import { CreateEndpointDialog } from '../components/create-endpoint-dialog'
import { EnhancedEndpointDetailPanel } from '../components/enhanced-endpoint-detail-panel'
import { EndpointOverviewStats } from '../components/endpoint-overview-stats'
import { TimeRangePicker } from '@/features/analytics/components/time-range-picker'
import { DataFreshnessIndicator } from '@/features/analytics/components/data-freshness-indicator'
import { useRequestsPerEndpoint } from '@/features/analytics/hooks'
import { formatDate } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { Plus, Unplug } from 'lucide-react'
import type { Endpoint } from '../types'
import type { AnalyticsParams } from '@/features/analytics/types'

export default function EndpointsPage() {
  const { project } = useProjectContext()
  const { data, isLoading } = useEndpoints(String(project.id), { page: 1, page_size: 1 })
  const deleteMutation = useDeleteEndpoint()
  const tz = useTimezone()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Endpoint | null>(null)
  const [analyticsParams, setAnalyticsParams] = useState<AnalyticsParams>({ days: 7 })

  // Fetch analytics data for all endpoints
  const endpointStatsQuery = useRequestsPerEndpoint(String(project.id), analyticsParams)

  // Calculate period label
  const periodLabel = useMemo(() => {
    const days = analyticsParams.days ?? 7
    const end = new Date()
    const start = subDays(end, days)
    return `${formatDate(start.toISOString(), tz)} - ${formatDate(end.toISOString(), tz)}`
  }, [analyticsParams.days, tz])

  const handleRefresh = () => {
    endpointStatsQuery.refetch()
  }

  function handleAddEndpoint() {
    setEditingEndpoint(null)
    setDialogOpen(true)
  }

  function handleEdit(endpoint: Endpoint) {
    setEditingEndpoint(endpoint)
    setDialogOpen(true)
  }

  function handleDeleteFromPanel(endpoint: Endpoint) {
    setSelectedEndpoint(null)
    setDeleteTarget(endpoint)
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return
    deleteMutation.mutate(
      { projectId: String(project.id), endpointId: String(deleteTarget.id) },
      {
        onSuccess: () => {
          setDeleteTarget(null)
          if (selectedEndpoint?.id === deleteTarget.id) {
            setSelectedEndpoint(null)
          }
        },
      }
    )
  }

  const totalCount = data?.pagination?.count ?? 0
  const isEmpty = !isLoading && totalCount === 0

  // Get all endpoints for overview (without pagination)
  const allEndpointsQuery = useEndpoints(String(project.id), { page: 1, page_size: 1000 })
  const allEndpoints = allEndpointsQuery.data?.results ?? []
  const endpointStats = endpointStatsQuery.data?.endpoints ?? []

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="min-w-0 flex-1 space-y-6 overflow-auto">
        <PageHeader
          title="Endpoints"
          description="Monitor and manage your API endpoints with comprehensive performance analytics."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <DataFreshnessIndicator
                isFetching={endpointStatsQuery.isFetching}
                dataUpdatedAt={endpointStatsQuery.dataUpdatedAt}
                onRefresh={handleRefresh}
              />
              <TimeRangePicker value={analyticsParams} onChange={setAnalyticsParams} />
              <Button onClick={handleAddEndpoint}>
                <Plus className="mr-2 h-4 w-4" />
                Add Endpoint
              </Button>
            </div>
          }
        />

        {isEmpty ? (
          <EmptyState
            icon={Unplug}
            title="No endpoints yet"
            description="Add your first API endpoint to start monitoring its performance and health."
            action={{
              label: 'Add Endpoint',
              onClick: handleAddEndpoint,
            }}
          />
        ) : (
          <>
            {/* Overview Statistics */}
            <EndpointOverviewStats
              endpoints={allEndpoints}
              endpointStats={endpointStats}
              isLoading={allEndpointsQuery.isLoading || endpointStatsQuery.isLoading}
              periodLabel={periodLabel}
            />

            {/* Endpoints Table */}
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <EndpointTable
                projectId={String(project.id)}
                onEdit={handleEdit}
                onSelect={setSelectedEndpoint}
                endpointStats={endpointStats}
              />
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedEndpoint && (
          <motion.div
            className="fixed inset-0 z-50 bg-background md:right-0 md:left-auto md:w-full md:max-w-[500px] lg:relative lg:h-full lg:w-full lg:max-w-[450px] lg:shrink-0"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          >
            <EnhancedEndpointDetailPanel
              endpoint={selectedEndpoint}
              onClose={() => setSelectedEndpoint(null)}
              onEdit={handleEdit}
              onDelete={handleDeleteFromPanel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <CreateEndpointDialog
        projectId={String(project.id)}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        endpoint={editingEndpoint}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete Endpoint"
        description={`Are you sure you want to delete ${deleteTarget?.method} ${deleteTarget?.path}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
