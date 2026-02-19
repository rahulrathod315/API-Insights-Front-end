import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { StaggerGroup, StaggerItem, AnimatedNumber } from '@/components/animation'
import { formatMs, formatPercent } from '@/lib/utils/format'
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

  const errorRate =
    data.summary.total_requests > 0
      ? (data.summary.error_requests / data.summary.total_requests) * 100
      : 0

  return (
    <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StaggerItem>
        <StatCard
          title="Total Requests"
          value={
            <AnimatedNumber
              value={data.summary.total_requests}
              formatter={(v) =>
                v >= 1_000_000
                  ? `${(v / 1_000_000).toFixed(1)}M`
                  : v >= 1_000
                  ? `${(v / 1_000).toFixed(1)}K`
                  : String(Math.round(v))
              }
            />
          }
          icon={Activity}
          iconClassName="bg-primary/10 text-primary"
          accentColor="var(--chart-1)"
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          title="Error Rate"
          value={<AnimatedNumber value={errorRate} formatter={formatPercent} />}
          icon={AlertTriangle}
          iconClassName="bg-destructive/10 text-destructive"
          accentColor="var(--chart-2)"
          invertTrend
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          title="Avg Response Time"
          value={<AnimatedNumber value={data.summary.avg_response_time_ms} formatter={formatMs} />}
          icon={Clock}
          iconClassName="bg-blue-500/10 text-blue-500"
          accentColor="#3B82F6"
          invertTrend
        />
      </StaggerItem>
      <StaggerItem>
        <StatCard
          title="Success Rate"
          value={<AnimatedNumber value={data.summary.success_rate} formatter={formatPercent} />}
          icon={CheckCircle}
          iconClassName="bg-success/10 text-success"
          accentColor="var(--chart-3)"
        />
      </StaggerItem>
    </StaggerGroup>
  )
}

export { OverviewStats }
export type { OverviewStatsProps }
