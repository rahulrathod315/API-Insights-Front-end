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
                title={<span className="text-xs font-bold uppercase tracking-wider text-success">Fast Endpoints</span>}
                value={
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{stats.fastEndpoints}</span>
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success ring-1 ring-inset ring-success/20">
                      {stats.fastPercent.toFixed(0)}%
                    </span>
                  </div>
                }
                description={
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-success" />
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">Threshold &lt; 200ms</span>
                  </div>
                }
                className="bg-background"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title={<span className="text-xs font-bold uppercase tracking-wider text-warning">Normal Endpoints</span>}
                value={
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{stats.normalEndpoints}</span>
                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning ring-1 ring-inset ring-warning/20">
                      {stats.normalPercent.toFixed(0)}%
                    </span>
                  </div>
                }
                description={
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-warning" />
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">Threshold 200-500ms</span>
                  </div>
                }
                className="bg-background"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title={<span className="text-xs font-bold uppercase tracking-wider text-destructive">Slow Endpoints</span>}
                value={
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">{stats.slowEndpoints}</span>
                    <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive ring-1 ring-inset ring-destructive/20">
                      {stats.slowPercent.toFixed(0)}%
                    </span>
                  </div>
                }
                description={
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">Threshold &gt; 500ms</span>
                  </div>
                }
                invertTrend
                className="bg-background"
              />
            </StaggerItem>
          </StaggerGroup>
        </CardContent>
      </Card>
    </div>
  )
}
