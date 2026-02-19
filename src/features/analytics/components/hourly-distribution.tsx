import { useMemo } from 'react'
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatMs } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface HourlyData {
  hour: string
  count: number
  avg_response_time: number
}

interface HourlyDistributionProps {
  data: HourlyData[]
  isLoading: boolean
  title?: string
  className?: string
}

export function HourlyDistribution({
  data,
  isLoading,
  title = '24-Hour Traffic Pattern',
  className,
}: HourlyDistributionProps) {
  const chartData = useMemo(() => {
    if (!data.length) return []
    
    // Fill missing hours
    const fullData = []
    const dataMap = new Map(data.map(d => [parseInt(d.hour.split(':')[0]), d]))
    
    for (let i = 0; i < 24; i++) {
      const existing = dataMap.get(i)
      fullData.push({
        hour: i,
        label: `${i.toString().padStart(2, '0')}:00`,
        count: existing?.count || 0,
        avg_response_time: existing?.avg_response_time || 0,
      })
    }
    return fullData
  }, [data])

  const maxCount = Math.max(...chartData.map(d => d.count))

  if (isLoading) {
    return <ChartSkeleton className="h-[350px]" />
  }

  return (
    <Card className={cn("overflow-hidden border-none shadow-md ring-1 ring-border", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>
          Request volume breakdown by hour of day (UTC)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No hourly data available.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  interval={2} // Show every 3rd hour to avoid clutter
                />
                <YAxis
                  tickFormatter={formatNumber}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-popover p-3 shadow-lg ring-1 ring-border animate-in fade-in-0 zoom-in-95">
                        <p className="mb-2 text-sm font-medium text-popover-foreground">
                          {label}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="text-sm font-bold text-foreground">
                              {formatNumber(data.count)} <span className="text-muted-foreground font-normal text-xs ml-1">requests</span>
                            </span>
                          </div>
                          {data.avg_response_time > 0 && (
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                              <span className="text-sm font-bold text-foreground">
                                {formatMs(data.avg_response_time)} <span className="text-muted-foreground font-normal text-xs ml-1">avg latency</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="url(#hourlyGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  animationDuration={1000}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fillOpacity={entry.count === maxCount ? 1 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
