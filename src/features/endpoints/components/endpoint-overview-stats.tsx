import { useMemo } from 'react'
import { Activity, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StaggerGroup, StaggerItem } from '@/components/animation/stagger-group'
import { StatCard } from '@/components/shared/stat-card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatMs } from '@/lib/utils/format'
import type { Endpoint } from '../types'
import type { EndpointStats } from '@/features/analytics/types'

interface EndpointOverviewStatsProps {
  endpoints: Endpoint[]
  endpointStats: EndpointStats[]
  isLoading?: boolean
  periodLabel?: string
}

export function EndpointOverviewStats({
  endpoints,
  endpointStats,
  isLoading = false,
  
}: EndpointOverviewStatsProps) {
  const stats = useMemo(() => {
    const totalEndpoints = endpoints.length
    const activeEndpoints = endpoints.filter((e) => e.is_active).length

    // Calculate aggregate stats from analytics data
    const totalRequests = endpointStats.reduce((sum, e) => sum + e.total_requests, 0)
    const totalResponseTime = endpointStats.reduce(
      (sum, e) => sum + e.avg_response_time_ms * e.total_requests,
      0
    )
    const avgResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0

    // Calculate performance tiers
    const fastEndpoints = endpointStats.filter((e) => e.avg_response_time_ms < 200).length
    const normalEndpoints = endpointStats.filter(
      (e) => e.avg_response_time_ms >= 200 && e.avg_response_time_ms < 500
    ).length
    const slowEndpoints = endpointStats.filter((e) => e.avg_response_time_ms >= 500).length

    return {
      totalEndpoints,
      activeEndpoints,
      totalRequests,
      avgResponseTime,
      fastEndpoints,
      normalEndpoints,
      slowEndpoints,
      fastPercent: totalEndpoints > 0 ? (fastEndpoints / totalEndpoints) * 100 : 0,
      normalPercent: totalEndpoints > 0 ? (normalEndpoints / totalEndpoints) * 100 : 0,
      slowPercent: totalEndpoints > 0 ? (slowEndpoints / totalEndpoints) * 100 : 0,
    }
  }, [endpoints, endpointStats])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid gap-4 md:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <StaggerGroup className="grid gap-4 md:grid-cols-4">
        <StaggerItem>
          <StatCard
            title="Total Endpoints"
            value={formatNumber(stats.totalEndpoints)}
            icon={TrendingUp}
            iconClassName="bg-primary/10 text-primary"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Active Endpoints"
            value={formatNumber(stats.activeEndpoints)}
            icon={CheckCircle}
            iconClassName="bg-success/10 text-success"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Total Requests"
            value={formatNumber(stats.totalRequests)}
            icon={Activity}
            iconClassName="bg-chart-1/10 text-chart-1"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Avg Response"
            value={formatMs(stats.avgResponseTime)}
            icon={Clock}
            iconClassName="bg-chart-2/10 text-chart-2"
          />
        </StaggerItem>
      </StaggerGroup>

      {/* Performance Overview Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <StaggerGroup className="grid gap-4 md:grid-cols-3">
            <StaggerItem>
              <StatCard
                title="Fast Endpoints"
                value={`${stats.fastEndpoints} (${stats.fastPercent.toFixed(0)}%)`}
                icon={CheckCircle}
                iconClassName="bg-success/10 text-success"
                className="border-success/20"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Normal Endpoints"
                value={`${stats.normalEndpoints} (${stats.normalPercent.toFixed(0)}%)`}
                icon={Activity}
                iconClassName="bg-warning/10 text-warning"
                className="border-warning/20"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Slow Endpoints"
                value={`${stats.slowEndpoints} (${stats.slowPercent.toFixed(0)}%)`}
                icon={Clock}
                iconClassName="bg-destructive/10 text-destructive"
                className="border-destructive/20"
              />
            </StaggerItem>
          </StaggerGroup>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>Fast: &lt;200ms</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <span>Normal: 200-500ms</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span>Slow: &gt;500ms</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
