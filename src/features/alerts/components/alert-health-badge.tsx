import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'
import { differenceInMinutes, parseISO } from 'date-fns'
import type { Alert } from '../types'

interface AlertHealthBadgeProps {
  alert: Alert
  className?: string
}

interface HealthScore {
  score: number
  level: 'healthy' | 'needs-tuning' | 'noisy'
  label: string
  details: string[]
}

function calculateHealthScore(alert: Alert): HealthScore {
  let score = 100
  const details: string[] = []

  // Factor 1: Trigger frequency (estimate based on last triggered)
  if (alert.last_triggered_at) {
    const daysSinceCreated = Math.max(
      1,
      differenceInMinutes(new Date(), parseISO(alert.created_at)) / (60 * 24)
    )
    const daysSinceTriggered = differenceInMinutes(
      new Date(),
      parseISO(alert.last_triggered_at)
    ) / (60 * 24)

    // Estimate trigger frequency (mock - in production would use actual history)
    const estimatedTriggersPerWeek = 7 / Math.max(1, daysSinceTriggered)

    if (estimatedTriggersPerWeek > 10) {
      score -= 30
      details.push('Very high trigger frequency')
    } else if (estimatedTriggersPerWeek > 5) {
      score -= 15
      details.push('High trigger frequency')
    } else if (estimatedTriggersPerWeek > 2) {
      score -= 5
      details.push('Moderate trigger frequency')
    }
  }

  // Factor 2: Alert configuration quality
  if (!alert.is_enabled) {
    score -= 20
    details.push('Alert is disabled')
  }

  if (alert.evaluation_window_minutes < 5) {
    score -= 10
    details.push('Very short evaluation window')
  }

  if (alert.cooldown_minutes < 15) {
    score -= 5
    details.push('Short cooldown period')
  }

  // Factor 3: Alert responsiveness
  if (!alert.notify_on_trigger && !alert.notify_on_resolve) {
    score -= 15
    details.push('No notifications configured')
  }

  // Factor 4: Status check
  if (alert.status === 'triggered' && alert.last_triggered_at) {
    const hoursSinceTriggered = differenceInMinutes(
      new Date(),
      parseISO(alert.last_triggered_at)
    ) / 60

    if (hoursSinceTriggered > 24) {
      score -= 20
      details.push('Triggered for over 24 hours')
    } else if (hoursSinceTriggered > 4) {
      score -= 10
      details.push('Triggered for several hours')
    }
  }

  // Determine level based on score
  let level: 'healthy' | 'needs-tuning' | 'noisy'
  let label: string

  if (score >= 80) {
    level = 'healthy'
    label = 'Healthy'
  } else if (score >= 50) {
    level = 'needs-tuning'
    label = 'Needs Tuning'
  } else {
    level = 'noisy'
    label = 'Noisy'
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    level,
    label,
    details: details.length > 0 ? details : ['Alert is well-configured'],
  }
}

export function AlertHealthBadge({ alert, className }: AlertHealthBadgeProps) {
  const health = calculateHealthScore(alert)

  const styles = {
    healthy: 'bg-success/10 text-success border-success/20',
    'needs-tuning': 'bg-warning/10 text-warning border-warning/20',
    noisy: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn('cursor-help font-medium', styles[health.level], className)}
          >
            {health.label} ({health.score})
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-[250px]">
          <div className="space-y-2">
            <p className="font-semibold">Health Score: {health.score}/100</p>
            <div className="space-y-1">
              {health.details.map((detail, index) => (
                <p key={index} className="text-xs">
                  • {detail}
                </p>
              ))}
            </div>
            <p className="text-xs italic text-muted-foreground">
              {health.level === 'healthy' && 'This alert is well-configured and performing optimally.'}
              {health.level === 'needs-tuning' && 'Consider adjusting thresholds or evaluation windows.'}
              {health.level === 'noisy' && 'This alert may need significant configuration changes.'}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
