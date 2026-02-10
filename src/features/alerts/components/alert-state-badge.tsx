import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, Activity } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Alert } from '../types'

interface AlertStateBadgeProps {
  status: Alert['status']
  className?: string
}

const statusConfig = {
  active: {
    variant: 'success' as const,
    label: 'Active',
    icon: Activity,
  },
  triggered: {
    variant: 'destructive' as const,
    label: 'Triggered',
    icon: AlertTriangle,
  },
  resolved: {
    variant: 'secondary' as const,
    label: 'Resolved',
    icon: CheckCircle2,
  },
}

function AlertStateBadge({ status, className }: AlertStateBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export { AlertStateBadge }
export type { AlertStateBadgeProps }
