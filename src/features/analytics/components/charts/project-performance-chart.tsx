import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface ProjectPerformanceData {
  name: string
  requests: number
  errorRate: number
}

interface ProjectPerformanceChartProps {
  data: ProjectPerformanceData[]
  className?: string
}

function getBarColor(errorRate: number): string {
  if (errorRate > 5) return 'var(--destructive)'
  if (errorRate > 1) return 'var(--warning)'
  return 'var(--chart-3)'
}

export function ProjectPerformanceChart({
  data,
  className,
}: ProjectPerformanceChartProps) {
  if (data.length === 0) {
    return (
      <Card className={cn('shadow-sm', className)}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Project Performance</CardTitle>
          <CardDescription>Request volume ranked by traffic, colored by error rate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
            No project data available.
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort descending by requests so the busiest project is at the top
  const sorted = [...data].sort((a, b) => b.requests - a.requests)

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Project Performance</CardTitle>
            <CardDescription>Request volume ranked by traffic, colored by error rate</CardDescription>
          </div>
          {/* Legend */}
          <div className="flex shrink-0 flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--chart-3)]" />
              <span>Low (&lt; 1%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--warning)]" />
              <span>Medium (1–5%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[var(--destructive)]" />
              <span>High (&gt; 5%)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sorted}
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="var(--border)"
                opacity={0.4}
              />
              <XAxis
                type="number"
                tickFormatter={formatNumber}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(name: string) =>
                  name.length > 12 ? `${name.slice(0, 11)}…` : name
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload as ProjectPerformanceData
                  return (
                    <div className="animate-in fade-in-0 zoom-in-95 rounded-lg border bg-popover p-3 shadow-lg ring-1 ring-border">
                      <p className="mb-2 text-sm font-semibold text-popover-foreground">{label}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-muted-foreground">Requests</span>
                          <span className="font-semibold tabular-nums">{formatNumber(d.requests)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-muted-foreground">Error Rate</span>
                          <span
                            className="font-semibold tabular-nums"
                            style={{ color: getBarColor(d.errorRate) }}
                          >
                            {formatPercent(d.errorRate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                }}
                cursor={{ fill: 'var(--muted)', opacity: 0.3 }}
              />
              <Bar dataKey="requests" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {sorted.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.errorRate)} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
