import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { BadgeProps } from '@/components/ui/badge'

type StatusState = 'active' | 'inactive' | 'triggered' | 'resolved'

interface StatusBadgeProps {
  code?: number
  state?: StatusState
  label?: string
  className?: string
}

function getHttpStatusVariant(code: number): BadgeProps['variant'] {
  if (code >= 200 && code < 300) return 'success'
  if (code >= 300 && code < 400) return 'secondary'
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'destructive'
  return 'default'
}

function getStateVariant(state: StatusState): BadgeProps['variant'] {
  switch (state) {
    case 'active':
      return 'success'
    case 'inactive':
      return 'secondary'
    case 'triggered':
      return 'warning'
    case 'resolved':
      return 'default'
    default:
      return 'outline'
  }
}

function getDefaultLabel(code?: number, state?: StatusState): string {
  if (code !== undefined) return String(code)
  if (state !== undefined) {
    return state.charAt(0).toUpperCase() + state.slice(1)
  }
  return ''
}

function StatusBadge({ code, state, label, className }: StatusBadgeProps) {
  const variant = code !== undefined
    ? getHttpStatusVariant(code)
    : state !== undefined
      ? getStateVariant(state)
      : 'default'

  const displayLabel = label ?? getDefaultLabel(code, state)

  return (
    <Badge variant={variant} className={cn(className)}>
      {displayLabel}
    </Badge>
  )
}

export { StatusBadge }
export type { StatusBadgeProps, StatusState }
