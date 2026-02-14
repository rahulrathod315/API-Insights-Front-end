import { useState } from 'react'
import { Plus, Shield, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useProjectContext } from '@/features/projects/project-context'
import { useSLADashboard, useDeleteSLA } from '../hooks'
import { SLAViolationBanner } from '../components/sla-violation-banner'
import { SLACard } from '../components/sla-card'
import { CreateSLADialog } from '../components/create-sla-dialog'
import { ComplianceGauges } from '../components/compliance-gauges'
import { UptimeTimeline } from '../components/uptime-timeline'
import { IncidentsTable } from '../components/incidents-table'
import type { SLAConfig } from '../types'

function SlaPage() {
  const { project } = useProjectContext()
  const projectId = String(project.id)
  const { data: dashboard, isLoading } = useSLADashboard(projectId)
  const deleteSLA = useDeleteSLA()

  const [selectedSlaId, setSelectedSlaId] = useState<number | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingSla, setEditingSla] = useState<SLAConfig | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingSlaId, setDeletingSlaId] = useState<number | null>(null)

  const selectedSla = dashboard?.slas.find((s) => s.id === selectedSlaId)

  function handleEdit(sla: SLAConfig) {
    setEditingSla(sla)
    setCreateDialogOpen(true)
  }

  function handleDeleteClick(slaId: number) {
    setDeletingSlaId(slaId)
    setDeleteDialogOpen(true)
  }

  function handleDeleteConfirm() {
    if (deletingSlaId === null) return
    deleteSLA.mutate(
      { projectId, slaId: String(deletingSlaId) },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false)
          setDeletingSlaId(null)
          if (selectedSlaId === deletingSlaId) setSelectedSlaId(null)
        },
      }
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SLA"
        description="Monitor and configure service level agreements"
        actions={
          <Button onClick={() => { setEditingSla(undefined); setCreateDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Create SLA
          </Button>
        }
      />

      {dashboard && dashboard.breaching_sla > 0 && (
        <SLAViolationBanner breachingCount={dashboard.breaching_sla} />
      )}

      {/* Summary Stats */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : dashboard ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total SLAs"
            value={dashboard.total_slas}
            icon={Shield}
            iconClassName="bg-blue-100 text-blue-600"
          />
          <StatCard
            title="Meeting SLA"
            value={dashboard.meeting_sla}
            icon={CheckCircle}
            iconClassName="bg-green-100 text-green-600"
          />
          <StatCard
            title="Breaching SLA"
            value={dashboard.breaching_sla}
            icon={XCircle}
            iconClassName="bg-red-100 text-red-600"
          />
        </div>
      ) : null}

      {/* SLA Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : dashboard && dashboard.slas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboard.slas.map((sla) => (
            <div key={sla.id} className="relative">
              <SLACard
                sla={sla}
                isSelected={selectedSlaId === sla.id}
                onClick={() => setSelectedSlaId(selectedSlaId === sla.id ? null : sla.id)}
              />
              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100"
                style={{ opacity: selectedSlaId === sla.id ? 1 : undefined }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); handleEdit(sla) }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(sla.id) }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Shield className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No SLAs configured yet</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => { setEditingSla(undefined); setCreateDialogOpen(true) }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create your first SLA
          </Button>
        </div>
      ) : null}

      {/* Detail Panel */}
      {selectedSla && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">{selectedSla.name} — Compliance Detail</h2>
          <ComplianceGauges compliance={selectedSla.compliance} />
          <UptimeTimeline projectId={projectId} slaId={String(selectedSla.id)} />
          <IncidentsTable projectId={projectId} slaId={String(selectedSla.id)} />
        </div>
      )}

      <CreateSLADialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        sla={editingSla}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete SLA"
        description="Are you sure you want to delete this SLA? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        isLoading={deleteSLA.isPending}
      />
    </div>
  )
}

export default SlaPage
