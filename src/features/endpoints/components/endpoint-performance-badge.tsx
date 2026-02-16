import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatMs } from '@/lib/utils/format'

interface EndpointPerformanceBadgeProps {
  responseTime: number
  className?: string
}

export function EndpointPerformanceBadge({
  responseTime,
  className,
}: EndpointPerformanceBadgeProps) {
  const getPerformanceLevel = (ms: number) => {
    if (ms < 200) return 'fast'
    if (ms < 500) return 'normal'
    return 'slow'
  }

  const level = getPerformanceLevel(responseTime)

  const styles = {
    fast: 'bg-success/10 text-success border-success/20',
    normal: 'bg-warning/10 text-warning border-warning/20',
    slow: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  const labels = {
    fast: 'Fast',
    normal: 'Normal',
    slow: 'Slow',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant="outline" className={cn('font-mono text-xs', styles[level])}>
        {formatMs(responseTime)}
      </Badge>
      <span className={cn('text-xs font-medium', {
        'text-success': level === 'fast',
        'text-warning': level === 'normal',
        'text-destructive': level === 'slow',
      })}>
        {labels[level]}
      </span>
    </div>
  )
}
