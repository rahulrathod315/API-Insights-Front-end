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
  'var(--chart-2)',   // Fast
  'var(--chart-1)',   // Normal
  'var(--chart-3)',   // Slow
  'var(--chart-4)',   // Very Slow
  'var(--chart-5)',   // Critical
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

    const labels = ['Fast (<100ms)', 'Normal (100-500ms)', 'Slow (500ms-1s)', 'Very Slow (1-2s)', 'Critical (>2s)']

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
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={buckets}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              className="text-xs"
              tick={{ fill: 'var(--muted-foreground)' }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'var(--muted-foreground)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
              }}
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
                <Cell key={i} fill={bucket.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
