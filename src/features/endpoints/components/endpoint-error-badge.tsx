import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatPercent } from '@/lib/utils/format'

interface EndpointErrorBadgeProps {
  errorRate: number
  className?: string
}

export function EndpointErrorBadge({
  errorRate,
  className,
}: EndpointErrorBadgeProps) {
  const getErrorLevel = (rate: number) => {
    if (rate < 5) return 'healthy'
    if (rate < 10) return 'warning'
    return 'critical'
  }

  const level = getErrorLevel(errorRate)

  const styles = {
    healthy: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    critical: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  return (
    <Badge variant="outline" className={cn('font-mono text-xs', styles[level], className)}>
      {formatPercent(errorRate)}
    </Badge>
  )
}
