import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { StaggerGroup, StaggerItem } from '@/components/animation'
import { formatNumber, formatMs, formatPercent } from '@/lib/utils/format'
import type { ProjectSummary } from '../types'

interface OverviewStatsProps {
  data: ProjectSummary
  isLoading: boolean
}

function OverviewStats({ data, isLoading }: OverviewStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StaggerItem>
        <StatCard
          title="Total Requests"
          value={formatNumber(data.summary.total_requests)}
          icon={Activity}
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          title="Error Rate"
          value={formatPercent(
            data.summary.total_requests > 0
              ? (data.summary.error_requests / data.summary.total_requests) * 100
              : 0
          )}
          icon={AlertTriangle}
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          title="Avg Response Time"
          value={formatMs(data.summary.avg_response_time_ms)}
          icon={Clock}
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          title="Success Rate"
          value={formatPercent(data.summary.success_rate)}
          icon={CheckCircle}
        />
      </StaggerItem>
    </StaggerGroup>
  )
}

export { OverviewStats }
export type { OverviewStatsProps }
