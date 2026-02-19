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
            accentColor="var(--chart-1)"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Active Endpoints"
            value={formatNumber(stats.activeEndpoints)}
            icon={CheckCircle}
            iconClassName="bg-success/10 text-success"
            accentColor="var(--chart-3)"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Total Requests"
            value={formatNumber(stats.totalRequests)}
            icon={Activity}
            iconClassName="bg-blue-500/10 text-blue-500"
            accentColor="#3B82F6"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            title="Avg Response"
            value={formatMs(stats.avgResponseTime)}
            icon={Clock}
            iconClassName="bg-primary/10 text-primary"
            accentColor="var(--chart-2)"
            invertTrend
          />
        </StaggerItem>
      </StaggerGroup>

      {/* Performance Overview Cards */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Performance Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <StaggerGroup className="grid gap-4 md:grid-cols-3">
            <StaggerItem>
              <StatCard
                title="Fast Endpoints"
                value={`${stats.fastEndpoints} (${stats.fastPercent.toFixed(0)}%)`}
                subtitle="Avg response time < 200ms"
                icon={CheckCircle}
                iconClassName="bg-success/10 text-success"
                accentColor="var(--chart-3)"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Normal Endpoints"
                value={`${stats.normalEndpoints} (${stats.normalPercent.toFixed(0)}%)`}
                subtitle="Avg response time 200–500ms"
                icon={Activity}
                iconClassName="bg-yellow-500/10 text-yellow-500"
                accentColor="var(--warning)"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Slow Endpoints"
                value={`${stats.slowEndpoints} (${stats.slowPercent.toFixed(0)}%)`}
                subtitle="Avg response time > 500ms"
                icon={Clock}
                iconClassName="bg-destructive/10 text-destructive"
                accentColor="var(--destructive)"
                invertTrend
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
