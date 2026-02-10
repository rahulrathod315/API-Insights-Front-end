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
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { TableSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils/cn'
import { formatDate } from '@/lib/utils/format'
import { useAuth } from '@/lib/auth/auth-context'
import { useProjectContext } from '@/features/projects/project-context'
import { useUpdateMemberRole, useRemoveMember } from '../hooks'
import { RoleBadge } from './role-badge'
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

  if (isLoading) {
    return <TableSkeleton />
  }

  if (members.length === 0) {
    return (
      <EmptyState
        title="No team members"
        description="Invite members to collaborate on this project."
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
                Member
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Role
              </th>
              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                Joined
              </th>
              <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isCurrentUser = user?.id === member.user.id
              const showRoleSelect = canChangeRole(currentUserRole, member.role)
              const showRemove = canRemoveMember(currentUserRole, member.role) && !isCurrentUser

              return (
                <tr
                  key={member.id}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    isCurrentUser && 'bg-muted/30'
                  )}
                >
                  <td className="p-4 align-middle">
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
                  </td>
                  <td className="p-4 align-middle">
                    {showRoleSelect ? (
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
                    ) : (
                      <RoleBadge role={member.role} />
                    )}
                  </td>
                  <td className="p-4 align-middle text-sm text-muted-foreground">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="p-4 align-middle text-right">
                    {showRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setMemberToRemove(member)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove member</span>
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

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
