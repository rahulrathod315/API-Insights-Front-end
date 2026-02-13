import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse, PaginationParams } from '@/lib/api/types'
import type {
  TeamMember,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  TransferOwnershipRequest,
} from './types'

export async function listMembers(projectId: string, params?: PaginationParams): Promise<PaginatedResponse<TeamMember>> {
  const response = await apiClient.get<PaginatedResponse<TeamMember>>(
    `/api/v1/projects/${projectId}/members/`,
    { params }
  )
  return response.data
}

export async function inviteMember(
  projectId: string,
  data: InviteMemberRequest
): Promise<TeamMember> {
  const response = await apiClient.post<TeamMember>(
    `/api/v1/projects/${projectId}/members/`,
    data
  )
  return response.data
}

export async function updateMemberRole(
  projectId: string,
  memberId: string,
  data: UpdateMemberRoleRequest
): Promise<TeamMember> {
  const response = await apiClient.patch<TeamMember>(
    `/api/v1/projects/${projectId}/members/${memberId}/`,
    data
  )
  return response.data
}

export async function removeMember(
  projectId: string,
  memberId: string
): Promise<void> {
  await apiClient.delete(`/api/v1/projects/${projectId}/members/${memberId}/`)
}

export async function leaveProject(projectId: string): Promise<void> {
  await apiClient.post(`/api/v1/projects/${projectId}/leave/`)
}

export async function transferOwnership(
  projectId: string,
  data: TransferOwnershipRequest
): Promise<void> {
  await apiClient.post(
    `/api/v1/projects/${projectId}/transfer-ownership/`,
    data
  )
}
