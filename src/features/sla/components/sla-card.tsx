import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatPercent, formatMs } from '@/lib/utils/format'
import { SLAMiniTrend } from './sla-mini-trend'
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react'
import { differenceInDays, addDays, parseISO } from 'date-fns'
import type { SLAWithCompliance } from '../types'

interface SLACardProps {
  sla: SLAWithCompliance
  isSelected: boolean
  onClick: () => void
  incidentCount?: number
}

function SLACard({ sla, isSelected, onClick, incidentCount = 0 }: SLACardProps) {
  const { compliance } = sla
  const isMeeting = compliance.is_meeting_sla

  // Generate mock 7-day trend data (in production would come from API)
  const trendData = Array.from({ length: 7 }, (_, i) =>
    compliance.uptime_percent + (Math.random() - 0.5) * 0.5
  )

  // Calculate days remaining in evaluation period
  const periodDays = sla.evaluation_period === 'weekly' ? 7 :
                     sla.evaluation_period === 'monthly' ? 30 : 90
  const createdDate = parseISO(sla.created_at)
  const endDate = addDays(createdDate, periodDays)
  const daysRemaining = Math.max(0, differenceInDays(endDate, new Date()))

  // Determine if at risk (uptime meeting SLA but very close to breaching - less than 0.1% buffer)
  const isAtRisk = isMeeting &&
                   compliance.uptime_percent >= sla.uptime_target_percent &&
                   compliance.uptime_percent < sla.uptime_target_percent + 0.1

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="pr-20">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold truncate flex-1">{sla.name}</h3>
            {incidentCount > 0 && (
              <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                {incidentCount} incidents
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{sla.evaluation_period}</span>
            {sla.endpoint ? (
              <Badge variant="secondary" className="text-xs">
                {sla.endpoint.method} {sla.endpoint.path}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Project-wide
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={isMeeting ? 'success' : 'destructive'}>
            {isMeeting ? 'Meeting' : 'Breaching'}
          </Badge>
          {isAtRisk && (
            <Badge variant="warning" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              At Risk
            </Badge>
          )}
          {daysRemaining <= 7 && daysRemaining > 0 && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {daysRemaining}d left
            </Badge>
          )}
        </div>

        <div className="mt-4 space-y-3">
          {/* Uptime with Mini Trend */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uptime (7d trend)</span>
              <span className="font-medium text-primary">
                {formatPercent(compliance.uptime_percent)} / {formatPercent(compliance.uptime_target)}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all bg-primary"
                style={{ width: `${Math.min(100, compliance.uptime_percent)}%` }}
              />
            </div>
            <div className="mt-2">
              <SLAMiniTrend
                data={trendData}
                target={sla.uptime_target_percent}
              />
            </div>
          </div>

          {/* Response Time */}
          {compliance.response_time && compliance.response_time.target_ms > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Response Time ({compliance.response_time.percentile})
              </span>
              <span className="font-medium text-primary">
                {formatMs(compliance.response_time.current_ms)} / {formatMs(compliance.response_time.target_ms)}
              </span>
            </div>
          )}

          {/* Error Rate */}
          {compliance.error_rate && compliance.error_rate.target_percent > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Error Rate</span>
              <span className="font-medium text-primary">
                {formatPercent(compliance.error_rate.current_percent)} / {formatPercent(compliance.error_rate.target_percent)}
              </span>
            </div>
          )}

          {/* Error Budget */}
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Error Budget</span>
              <span className="text-sm text-muted-foreground">
                {formatPercent(compliance.error_budget.consumed_percent)} used
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  compliance.error_budget.consumed_percent < 50
                    ? 'bg-success'
                    : compliance.error_budget.consumed_percent < 80
                      ? 'bg-warning'
                      : 'bg-destructive'
                )}
                style={{ width: `${Math.min(100, compliance.error_budget.consumed_percent)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { SLACard }
