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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { useChartAnimation } from '@/lib/animation'
import type { TimeSeriesPoint } from '../types'

interface ResponseTimeDistributionProps {
  data: TimeSeriesPoint[]
  isLoading?: boolean
}

interface Bucket {
  label: string
  count: number
  percentage: number
  color: string
}

const BUCKET_COLORS = [
  'var(--chart-1)',   // Fast (<100ms)
  'var(--chart-2)',   // Normal (100-500ms)
  'var(--chart-3)',   // Slow (500ms-1s)
  'var(--chart-4)',   // Very Slow (1-2s)
  'var(--chart-5)',   // Critical (>2s)
]

export function ResponseTimeDistribution({ data, isLoading }: ResponseTimeDistributionProps) {
  const animation = useChartAnimation()

  const buckets = useMemo((): Bucket[] => {
    const counts = [0, 0, 0, 0, 0]
    let total = 0

    for (const point of data) {
      const ms = point.avg_response_time
      const weight = point.request_count
      total += weight
      if (ms < 100) counts[0] += weight
      else if (ms < 500) counts[1] += weight
      else if (ms < 1000) counts[2] += weight
      else if (ms < 2000) counts[3] += weight
      else counts[4] += weight
    }

    const labels = ['<100ms', '100-500ms', '500ms-1s', '1-2s', '>2s']

    return labels.map((label, i) => ({
      label,
      count: counts[i],
      percentage: total > 0 ? (counts[i] / total) * 100 : 0,
      color: BUCKET_COLORS[i],
    }))
  }, [data])

  if (isLoading) {
    return <ChartSkeleton />
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Response Time Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Response Time Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={buckets}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              className="text-xs"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              interval={0}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const item = payload[0].payload as Bucket
                return (
                  <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                    <p className="font-medium">{item.label}</p>
                    <p>{item.count.toLocaleString()} requests ({item.percentage.toFixed(1)}%)</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} {...animation}>
              {buckets.map((bucket, i) => (
                <Cell key={i} fill={bucket.color} stroke="var(--background)" strokeWidth={2} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
