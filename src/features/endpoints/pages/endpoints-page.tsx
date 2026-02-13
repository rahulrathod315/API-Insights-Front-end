import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useProjectContext } from '@/features/projects/project-context'
import { useEndpoints, useDeleteEndpoint } from '../hooks'
import { EndpointTable } from '../components/endpoint-table'
import { CreateEndpointDialog } from '../components/create-endpoint-dialog'
import { EndpointDetailPanel } from '../components/endpoint-detail-panel'
import { Plus, Unplug } from 'lucide-react'
import type { Endpoint } from '../types'

export default function EndpointsPage() {
  const { project } = useProjectContext()
  const { data, isLoading } = useEndpoints(String(project.id), { page: 1, page_size: 1 })
  const deleteMutation = useDeleteEndpoint()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null)
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Endpoint | null>(null)

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

  return (
    <div className="flex h-full">
      <div className="flex-1 space-y-6 p-6">
        <PageHeader
          title="Endpoints"
          description="Monitor and manage your API endpoints."
          actions={
            <Button onClick={handleAddEndpoint}>
              <Plus className="mr-2 h-4 w-4" />
              Add Endpoint
            </Button>
          }
        />

        {isLoading ? (
          <TableSkeleton />
        ) : isEmpty ? (
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
          <EndpointTable projectId={String(project.id)} onEdit={handleEdit} />
        )}
      </div>

      <AnimatePresence>
        {selectedEndpoint && (
          <motion.div
            className="w-[400px] shrink-0"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          >
            <EndpointDetailPanel
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
