import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, LogOut, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useProjectContext } from '@/features/projects/project-context'
import { useTeamMembers, useLeaveProject } from '../hooks'
import { MembersTable } from '../components/members-table'
import { InviteMemberDialog } from '../components/invite-member-dialog'
import { TransferOwnershipDialog } from '../components/transfer-ownership-dialog'

const DEFAULT_PAGE_SIZE = 10
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

export default function TeamPage() {
  const { project } = useProjectContext()
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const { data, isLoading } = useTeamMembers(String(project.id), { page, page_size: pageSize })
  const members = data?.results ?? []
  const pagination = data?.pagination
  const totalPages = pagination?.total_pages ?? 1

  const leaveProjectMutation = useLeaveProject()

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)

  const currentUserRole = project.my_role
  const isOwner = currentUserRole === 'owner'
  const isAdmin = currentUserRole === 'admin'
  const canInvite = isOwner || isAdmin

  function handleLeaveProject() {
    leaveProjectMutation.mutate(String(project.id), {
      onSuccess: () => {
        navigate('/projects', { replace: true })
      },
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Manage members and their roles for this project."
        actions={
          <div className="flex items-center gap-2">
            {isOwner && (
              <Button
                variant="outline"
                onClick={() => setTransferDialogOpen(true)}
              >
                <ArrowRightLeft className="h-4 w-4" />
                Transfer Ownership
              </Button>
            )}
            {!isOwner && (
              <Button
                variant="outline"
                onClick={() => setLeaveDialogOpen(true)}
              >
                <LogOut className="h-4 w-4" />
                Leave Project
              </Button>
            )}
            {canInvite && (
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>
        }
      />

      <MembersTable
        members={members}
        isLoading={isLoading}
        currentUserRole={currentUserRole}
      />

      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing{' '}
              {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, pagination.count)}{' '}
              of {pagination.count} members
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

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <TransferOwnershipDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        members={members}
        projectName={project.name}
      />

      <ConfirmDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        title="Leave project"
        description="Are you sure you want to leave this project? You will lose access immediately and will need to be re-invited to rejoin."
        confirmLabel="Leave project"
        variant="destructive"
        onConfirm={handleLeaveProject}
        isLoading={leaveProjectMutation.isPending}
      />
    </div>
  )
}
