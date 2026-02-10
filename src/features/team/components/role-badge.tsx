import { Badge } from '@/components/ui/badge'
import type { TeamMember } from '../types'

const roleVariant: Record<
  TeamMember['role'],
  'default' | 'secondary' | 'success' | 'outline'
> = {
  owner: 'default',
  admin: 'secondary',
  member: 'success',
  viewer: 'outline',
}

const roleLabel: Record<TeamMember['role'], string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
  viewer: 'Viewer',
}

interface RoleBadgeProps {
  role: TeamMember['role']
}

function RoleBadge({ role }: RoleBadgeProps) {
  return <Badge variant={roleVariant[role]}>{roleLabel[role]}</Badge>
}

export { RoleBadge }
export type { RoleBadgeProps }
