import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StaggerGroup, StaggerItem } from '@/components/animation/stagger-group'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { StatCard } from '@/components/shared/stat-card'
import { formatPercent } from '@/lib/utils/format'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'
import { TrendingUp, PieChartIcon, BarChart3, AlertTriangle } from 'lucide-react'
import type { SLAWithCompliance, DowntimeIncident } from '../types'

interface SLAOverviewDashboardProps {
  slas: SLAWithCompliance[]
  allIncidents?: DowntimeIncident[]
  isLoading?: boolean
}

const ROOT_CAUSE_COLORS: Record<string, string> = {
  high_error_rate: '#ef4444', // Red
  no_traffic: '#f59e0b', // Orange
  high_response_time: '#3b82f6', // Blue
  default: '#8b5cf6', // Purple
}

export function SLAOverviewDashboard({
  slas,
  allIncidents = [],
  isLoading = false,
}: SLAOverviewDashboardProps) {
  const [hoveredRootCause, setHoveredRootCause] = useState<number | null>(null)

  const analytics = useMemo(() => {
    const totalSLAs = slas.length
    const meetingSLA = slas.filter((s) => s.compliance.is_meeting_sla).length
    const breachingSLA = slas.filter((s) => !s.compliance.is_meeting_sla).length

    // Calculate average uptime
    const avgUptime =
      totalSLAs > 0
        ? slas.reduce((sum, s) => sum + s.compliance.uptime_percent, 0) / totalSLAs
        : 0

    // Calculate average incident duration (mock - would come from actual data)
    const totalIncidents = allIncidents.length
    const avgIncidentDuration =
      totalIncidents > 0
        ? allIncidents.reduce((sum, i) => sum + i.duration_seconds, 0) / totalIncidents / 60
        : 0

    // SLAs at risk (uptime meeting SLA but very close to breaching - less than 0.1% buffer)
    const slasAtRisk = slas.filter(
      (s) =>
        s.compliance.is_meeting_sla &&
        s.compliance.uptime_percent >= s.uptime_target_percent &&
        s.compliance.uptime_percent < s.uptime_target_percent + 0.1
    ).length

    // Root cause breakdown
    const rootCauseBreakdown = allIncidents.reduce((acc, incident) => {
      const cause = incident.root_cause || 'unknown'
      acc[cause] = (acc[cause] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const rootCauseData = Object.entries(rootCauseBreakdown).map(([name, value]) => ({
      name: name === 'high_error_rate' ? 'High Error Rate' :
            name === 'no_traffic' ? 'No Traffic' :
            name === 'high_response_time' ? 'High Response Time' : 'Unknown',
      value,
      color: ROOT_CAUSE_COLORS[name] || ROOT_CAUSE_COLORS.default,
    }))

    // SLA Performance Comparison (horizontal bar chart data)
    const slaComparison = slas
      .map((sla) => ({
        name: sla.name.length > 20 ? sla.name.substring(0, 20) + '...' : sla.name,
        uptime: sla.compliance.uptime_percent,
        target: sla.uptime_target_percent,
        isMeeting: sla.compliance.is_meeting_sla,
      }))
      .sort((a, b) => b.uptime - a.uptime)

    // Calculate real trend data from incidents
    // Group incidents by date to show downtime pattern over last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const dateStr = date.toISOString().split('T')[0]

      // Count incidents on this day
      const incidentsOnDay = allIncidents.filter((incident) => {
        const incidentDate = incident.started_at.split('T')[0]
        return incidentDate === dateStr
      })

      // Calculate downtime hours on this day
      const downtimeHours = incidentsOnDay.reduce((sum, incident) => {
        return sum + (incident.duration_seconds / 3600)
      }, 0)

      // Calculate uptime % (assuming 24 hour periods)
      const uptimePercent = Math.max(0, Math.min(100, ((24 - downtimeHours) / 24) * 100))

      return {
        day: i + 1,
        uptime: uptimePercent,
        date: dateStr,
      }
    })

    const trendData = last30Days

    return {
      totalSLAs,
      meetingSLA,
      breachingSLA,
      avgUptime,
      totalIncidents,
      avgIncidentDuration,
      slasAtRisk,
      rootCauseData,
      slaComparison,
      trendData,
    }
  }, [slas, allIncidents])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid gap-6 lg:grid-cols-3">
          <CardSkeleton className="lg:col-span-2" />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (slas.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total SLAs"
          value={analytics.totalSLAs}
          icon={BarChart3}
          iconClassName="bg-primary/10 text-primary"
          accentColor="var(--chart-1)"
        />
        <StatCard
          title="Average Uptime"
          value={formatPercent(analytics.avgUptime)}
          icon={TrendingUp}
          iconClassName="bg-success/10 text-success"
          accentColor="var(--chart-3)"
        />
        <StatCard
          title="Total Incidents"
          value={analytics.totalIncidents}
          icon={AlertTriangle}
          iconClassName="bg-destructive/10 text-destructive"
          accentColor="var(--destructive)"
        />
        <StatCard
          title="SLAs at Risk"
          value={analytics.slasAtRisk}
          icon={AlertTriangle}
          iconClassName="bg-warning/10 text-warning"
          accentColor="var(--warning)"
        />
      </div>

      {/* SLA Overview Section */}
      <StaggerGroup className="grid gap-6 lg:grid-cols-3">
        {/* SLA Compliance Trend */}
        <StaggerItem className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                SLA Compliance Trend (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={analytics.trendData}>
                  <defs>
                    <linearGradient id="slaUptimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                    domain={[95, 100]}
                    className="text-xs"
                    tick={{ fill: '#71717a' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '6px',
                    }}
                    itemStyle={{
                      color: '#10b981',
                    }}
                    labelStyle={{
                      color: '#fafafa',
                    }}
                    formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(2)}%`, 'Uptime']}
                  />
                  <ReferenceLine
                    y={99.9}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{ value: 'Target', position: 'right', fill: '#71717a' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="uptime"
                    stroke="#10b981"
                    fill="url(#slaUptimeGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Downtime Root Cause Analysis */}
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChartIcon className="h-4 w-4" />
                Root Cause Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.rootCauseData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.rootCauseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={3}
                        cornerRadius={3}
                        dataKey="value"
                        isAnimationActive={false}
                        onMouseEnter={(_, index) => setHoveredRootCause(index)}
                        onMouseLeave={() => setHoveredRootCause(null)}
                      >
                        {analytics.rootCauseData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke="var(--background)"
                            strokeWidth={2}
                            opacity={hoveredRootCause === null || hoveredRootCause === index ? 1 : 0.35}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0]
                          return (
                            <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg ring-1 ring-border">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.payload.color }} />
                                <span className="text-sm font-medium text-popover-foreground">{d.name}</span>
                              </div>
                              <p className="ml-4 text-xs text-muted-foreground">{d.value} incident{(d.value as number) !== 1 ? 's' : ''}</p>
                            </div>
                          )
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-2">
                    {analytics.rootCauseData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-medium tabular-nums">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  No incidents recorded
                </div>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      {/* SLA Performance Comparison */}
      {analytics.slaComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              SLA Performance Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(200, analytics.slaComparison.length * 40)}>
              <BarChart data={analytics.slaComparison} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" stroke="#27272a" />
                <XAxis
                  type="number"
                  domain={[95, 100]}
                  className="text-xs"
                  tick={{ fill: '#71717a' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: '#71717a' }}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '6px',
                    color: '#fafafa',
                  }}
                  cursor={{ fill: 'transparent' }}
                  formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(2)}%`, 'Uptime']}
                />
                <ReferenceLine
                  x={99.9}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                />
                <Bar
                  dataKey="uptime"
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                >
                  {analytics.slaComparison.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isMeeting ? '#10b981' : '#ef4444'}
                      style={{ filter: 'none', opacity: 1 }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* At-Risk SLAs Warning */}
      {analytics.slasAtRisk > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-warning">
                {analytics.slasAtRisk} SLA{analytics.slasAtRisk !== 1 ? 's' : ''} at risk
              </p>
              <p className="text-sm text-muted-foreground">
                Uptime is close to the target threshold. Monitor closely to prevent breaches.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
