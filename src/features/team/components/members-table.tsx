import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable } from '@/components/shared/data-table'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { formatDate } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { useAuth } from '@/lib/auth/auth-context'
import { useProjectContext } from '@/features/projects/project-context'
import { useUpdateMemberRole, useRemoveMember } from '../hooks'
import { RoleBadge } from './role-badge'
import type { Column } from '@/components/shared/data-table'
import type { TeamMember } from '../types'

interface MembersTableProps {
  members: TeamMember[]
  isLoading: boolean
  currentUserRole: TeamMember['role']
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function canChangeRole(
  viewerRole: TeamMember['role'],
  targetRole: TeamMember['role']
): boolean {
  if (viewerRole === 'owner') return targetRole !== 'owner'
  if (viewerRole === 'admin') return targetRole === 'member' || targetRole === 'viewer'
  return false
}

function canRemoveMember(
  viewerRole: TeamMember['role'],
  targetRole: TeamMember['role']
): boolean {
  if (viewerRole === 'owner') return targetRole !== 'owner'
  if (viewerRole === 'admin') return targetRole === 'member' || targetRole === 'viewer'
  return false
}

function MembersTable({ members, isLoading, currentUserRole }: MembersTableProps) {
  const { user } = useAuth()
  const tz = useTimezone()
  const { project } = useProjectContext()
  const updateRoleMutation = useUpdateMemberRole()
  const removeMemberMutation = useRemoveMember()

  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)

  function handleRoleChange(member: TeamMember, newRole: string) {
    updateRoleMutation.mutate({
      projectId: String(project.id),
      memberId: member.id,
      data: { role: newRole as 'admin' | 'member' | 'viewer' },
    })
  }

  function handleRemoveMember() {
    if (!memberToRemove) return
    removeMemberMutation.mutate(
      { projectId: String(project.id), memberId: memberToRemove.id },
      { onSuccess: () => setMemberToRemove(null) }
    )
  }

  const columns: Column<TeamMember>[] = [
    {
      header: 'Member',
      accessor: 'user',
      cell: (member) => {
        const isCurrentUser = user?.id === member.user.id
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(member.user.first_name, member.user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {member.user.first_name} {member.user.last_name}
                {isCurrentUser && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    (you)
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {member.user.email}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      header: 'Role',
      accessor: 'role',
      cell: (member) => {
        const showRoleSelect = canChangeRole(currentUserRole, member.role)
        if (showRoleSelect) {
          return (
            <Select
              value={member.role}
              onValueChange={(value) => handleRoleChange(member, value)}
              disabled={updateRoleMutation.isPending}
            >
              <SelectTrigger className="h-8 w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        return <RoleBadge role={member.role} />
      },
    },
    {
      header: 'Joined',
      accessor: 'created_at',
      cell: (member) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(member.created_at, tz)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: 'id',
      className: 'text-right',
      cell: (member) => {
        const isCurrentUser = user?.id === member.user.id
        const showRemove = canRemoveMember(currentUserRole, member.role) && !isCurrentUser
        if (!showRemove) return null
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => setMemberToRemove(member)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove member</span>
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <DataTable<TeamMember>
        columns={columns}
        data={members}
        isLoading={isLoading}
        rowKey={(m) => m.id}
        rowClassName={(m) => (user?.id === m.user.id ? 'bg-muted/30' : '')}
        emptyTitle="No team members"
        emptyDescription="Invite members to collaborate on this project."
      />

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => {
          if (!open) setMemberToRemove(null)
        }}
        title="Remove team member"
        description={
          memberToRemove
            ? `Are you sure you want to remove ${memberToRemove.user.first_name} ${memberToRemove.user.last_name} from this project? They will lose access immediately.`
            : ''
        }
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleRemoveMember}
        isLoading={removeMemberMutation.isPending}
      />
    </>
  )
}

export { MembersTable }
export type { MembersTableProps }
