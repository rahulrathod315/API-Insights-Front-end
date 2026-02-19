import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { TimeSeriesPoint } from '../types'

interface ResponseTimeDistributionProps {
  data: TimeSeriesPoint[]
  isLoading?: boolean
  className?: string
}

interface Bucket {
  label: string
  count: number
  percentage: number
  color: string
  desc: string
}

const BUCKET_DEFINITIONS = [
  { label: '<100ms', max: 100, color: 'var(--success)', desc: 'Excellent' },
  { label: '100-500ms', max: 500, color: 'var(--chart-1)', desc: 'Good' },
  { label: '500ms-1s', max: 1000, color: 'var(--warning)', desc: 'Fair' },
  { label: '1-2s', max: 2000, color: 'var(--chart-4)', desc: 'Poor' },
  { label: '>2s', max: Infinity, color: 'var(--destructive)', desc: 'Critical' },
]

export function ResponseTimeDistribution({ data, isLoading, className }: ResponseTimeDistributionProps) {

  const { buckets } = useMemo(() => {
    const counts = new Array(BUCKET_DEFINITIONS.length).fill(0)
    let total = 0

    for (const point of data) {
      const ms = point.avg_response_time
      const weight = point.request_count
      total += weight
      
      const idx = BUCKET_DEFINITIONS.findIndex(b => ms < b.max)
      if (idx !== -1) counts[idx] += weight
      else counts[BUCKET_DEFINITIONS.length - 1] += weight
    }

    const buckets = BUCKET_DEFINITIONS.map((def, i) => ({
      ...def,
      count: counts[i],
      percentage: total > 0 ? (counts[i] / total) * 100 : 0,
    }))

    return { buckets, total }
  }, [data])

  if (isLoading) {
    return <ChartSkeleton className="h-[350px]" />
  }

  return (
    <Card className={cn("overflow-hidden border-none shadow-md ring-1 ring-border", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Latency Distribution</CardTitle>
        <CardDescription>
          Request volume by response time bucket
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        {data.length === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No data available.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buckets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="label"
                  className="text-xs"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  className="text-xs"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const item = payload[0].payload as Bucket
                    return (
                      <div className="rounded-lg border bg-popover p-3 shadow-lg ring-1 ring-border animate-in fade-in-0 zoom-in-95">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="h-2 w-2 rounded-full" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <p className="text-sm font-medium text-popover-foreground">
                            {item.label} <span className="text-muted-foreground font-normal text-xs ml-1">({item.desc})</span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground">
                            {formatNumber(item.count)} <span className="text-muted-foreground font-normal text-xs ml-1">requests</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPercent(item.percentage)}% of total volume
                          </p>
                        </div>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50} animationDuration={1000}>
                  {buckets.map((bucket, i) => (
                    <Cell 
                      key={i} 
                      fill={bucket.color} 
                      fillOpacity={0.8}
                      stroke={bucket.color}
                      strokeWidth={1}
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
