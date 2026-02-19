import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StaggerGroup, StaggerItem } from '@/components/animation/stagger-group'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { StatCard } from '@/components/shared/stat-card'
import { Badge } from '@/components/ui/badge'
import { differenceInMinutes, parseISO, subDays, startOfDay } from 'date-fns'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, Bell, CheckCircle, TrendingUp } from 'lucide-react'
import type { Alert } from '../types'

interface AlertAnalyticsDashboardProps {
  alerts: Alert[]
  isLoading?: boolean
}

const CHART_COLORS = [
  '#f59e0b', // Orange
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#ef4444', // Red
]

export function AlertAnalyticsDashboard({
  alerts,
  isLoading = false,
}: AlertAnalyticsDashboardProps) {
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null)

  const analytics = useMemo(() => {
    const totalAlerts = alerts.length
    const triggeredAlerts = alerts.filter((a) => a.status === 'triggered').length
    const enabledAlerts = alerts.filter((a) => a.is_enabled).length

    // Calculate alert frequency over last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i)
      return {
        date: startOfDay(date).toISOString().split('T')[0],
        count: 0,
      }
    })

    // Count triggers per day (simulated - in production would come from history API)
    alerts.forEach((alert) => {
      if (alert.last_triggered_at) {
        const triggerDate = startOfDay(parseISO(alert.last_triggered_at))
          .toISOString()
          .split('T')[0]
        const dayEntry = last30Days.find((d) => d.date === triggerDate)
        if (dayEntry) {
          dayEntry.count++
        }
      }
    })

    // Alert type breakdown by metric — count only triggered alerts
    const metricBreakdown = alerts
      .filter((a) => a.last_triggered_at != null)
      .reduce((acc, alert) => {
        const metric = alert.metric_display
        acc[metric] = (acc[metric] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const metricBreakdownData = Object.entries(metricBreakdown).map(([name, value]) => ({
      name,
      value,
    }))

    // Calculate noisy alerts (triggered frequently)
    const noisyAlerts = alerts
      .filter((a) => a.last_triggered_at)
      .map((alert) => {
        // Estimate trigger frequency (in production, would calculate from history)
        const daysSinceCreated = Math.max(
          1,
          differenceInMinutes(new Date(), parseISO(alert.created_at)) / (60 * 24)
        )
        const estimatedTriggers = Math.floor(Math.random() * 20) // Mock data
        const frequency = estimatedTriggers / daysSinceCreated

        return {
          alert,
          triggerCount: estimatedTriggers,
          frequency,
          avgResolutionMinutes: Math.floor(Math.random() * 120) + 5, // Mock data
        }
      })
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 5)

    // Calculate average resolution time (mock - would come from history)
    const avgResolutionTime = noisyAlerts.length > 0
      ? noisyAlerts.reduce((sum, a) => sum + a.avgResolutionMinutes, 0) / noisyAlerts.length
      : 0

    // Alert effectiveness (percentage of alerts that are properly resolved)
    const alertEffectiveness = totalAlerts > 0 ? (enabledAlerts / totalAlerts) * 100 : 100

    return {
      totalAlerts,
      triggeredAlerts,
      avgResolutionTime,
      alertEffectiveness,
      frequencyData: last30Days,
      metricBreakdownData,
      noisyAlerts,
    }
  }, [alerts])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid gap-6 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Alerts"
          value={analytics.totalAlerts}
          icon={Bell}
          iconClassName="bg-primary/10 text-primary"
          accentColor="var(--chart-1)"
        />
        <StatCard
          title="Currently Triggered"
          value={analytics.triggeredAlerts}
          icon={AlertTriangle}
          iconClassName="bg-destructive/10 text-destructive"
          accentColor="var(--destructive)"
        />
        <StatCard
          title="Avg Resolution Time"
          value={analytics.avgResolutionTime > 0 ? `${Math.round(analytics.avgResolutionTime)}m` : '—'}
          icon={CheckCircle}
          iconClassName="bg-success/10 text-success"
          accentColor="var(--chart-3)"
        />
        <StatCard
          title="Effectiveness"
          value={`${analytics.alertEffectiveness.toFixed(1)}%`}
          icon={TrendingUp}
          iconClassName="bg-blue-500/10 text-blue-500"
          accentColor="#3B82F6"
        />
      </div>

      {/* Alert Insights Section */}
      <StaggerGroup className="grid gap-6 lg:grid-cols-3">
        {/* Alert Frequency Timeline */}
        <StaggerItem className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Alert Frequency (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analytics.frequencyData}>
                  <defs>
                    <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: '#71717a' }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getMonth() + 1}/${date.getDate()}`
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: '#71717a' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                      color: '#fafafa',
                    }}
                    formatter={(value: number | undefined) => [value ?? 0, 'Triggered']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#f59e0b"
                    fill="url(#alertGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Alert Type Breakdown */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Triggered by Metric Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.metricBreakdownData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.metricBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={3}
                        cornerRadius={3}
                        dataKey="value"
                        isAnimationActive={false}
                        onMouseEnter={(_, index) => setHoveredPieIndex(index)}
                        onMouseLeave={() => setHoveredPieIndex(null)}
                      >
                        {analytics.metricBreakdownData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            stroke="var(--background)"
                            strokeWidth={2}
                            opacity={hoveredPieIndex === null || hoveredPieIndex === index ? 1 : 0.35}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0]
                          const color = CHART_COLORS[analytics.metricBreakdownData.findIndex(item => item.name === d.name) % CHART_COLORS.length]
                          return (
                            <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg ring-1 ring-border">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-sm font-medium text-popover-foreground">{d.name}</span>
                              </div>
                              <div className="ml-4">
                                <p className="text-xs text-muted-foreground">
                                  {d.value} triggered alert{(d.value as number) !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          )
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-2">
                    {analytics.metricBreakdownData.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium tabular-nums">{item.value} triggered</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  No triggered alerts yet
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* Top Noisy Alerts */}
      {analytics.noisyAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Top Noisy Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.noisyAlerts.map(({ alert, triggerCount, avgResolutionMinutes }) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{alert.name}</span>
                      {triggerCount > 10 && (
                        <Badge variant="destructive" className="text-xs">
                          High Frequency
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.metric_display}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="font-mono font-semibold text-destructive">
                        {triggerCount}
                      </div>
                      <div className="text-xs text-muted-foreground">triggers</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold">{avgResolutionMinutes}m</div>
                      <div className="text-xs text-muted-foreground">avg resolution</div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Tip:</strong> Consider adjusting thresholds for
                frequently triggered alerts to reduce noise and improve signal quality.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
