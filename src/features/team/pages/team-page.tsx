import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, LogOut, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/page-header'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useProjectContext } from '@/features/projects/project-context'
import { useTeamMembers, useLeaveProject } from '../hooks'
import { MembersTable } from '../components/members-table'
import { InviteMemberDialog } from '../components/invite-member-dialog'
import { TransferOwnershipDialog } from '../components/transfer-ownership-dialog'

export default function TeamPage() {
  const { project } = useProjectContext()
  const navigate = useNavigate()

  const { data: members = [], isLoading } = useTeamMembers(String(project.id))
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
