import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  leaveProject,
  transferOwnership,
} from './api'
import type { PaginationParams } from '@/lib/api/types'
import type { InviteMemberRequest, UpdateMemberRoleRequest, TransferOwnershipRequest } from './types'

const teamKeys = {
  all: (projectId: string) => ['team', projectId] as const,
  list: (projectId: string, params?: PaginationParams) =>
    ['team', projectId, params] as const,
}

export function useTeamMembers(projectId: string, params?: PaginationParams) {
  return useQuery({
    queryKey: teamKeys.list(projectId, params),
    queryFn: () => listMembers(projectId, params),
    enabled: !!projectId,
  })
}

export function useInviteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string
      data: InviteMemberRequest
    }) => inviteMember(projectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.all(variables.projectId),
      })
    },
  })
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      memberId,
      data,
    }: {
      projectId: string
      memberId: string | number
      data: UpdateMemberRoleRequest
    }) => updateMemberRole(projectId, String(memberId), data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.all(variables.projectId),
      })
    },
  })
}

export function useRemoveMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      memberId,
    }: {
      projectId: string
      memberId: string | number
    }) => removeMember(projectId, String(memberId)),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.all(variables.projectId),
      })
    },
  })
}

export function useLeaveProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => leaveProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useTransferOwnership() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string
      data: TransferOwnershipRequest
    }) => transferOwnership(projectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: teamKeys.all(variables.projectId),
      })
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId],
      })
    },
  })
}
