export interface TeamMember {
  id: number
  user: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
  role: 'owner' | 'admin' | 'member' | 'viewer'
  invited_by: { id: number; email: string } | null
  created_at: string
  updated_at: string
}

export interface InviteMemberRequest {
  email: string
  role?: 'admin' | 'member' | 'viewer'
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'member' | 'viewer'
}

export interface TransferOwnershipRequest {
  user_id: number
}
