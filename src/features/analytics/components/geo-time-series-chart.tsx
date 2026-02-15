import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { useChartAnimation } from '@/lib/animation'
import { formatDateTime } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import type { GeoTimeSeriesPoint } from '../types'

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const

interface GeoTimeSeriesChartProps {
  data: GeoTimeSeriesPoint[]
  isLoading?: boolean
}

export function GeoTimeSeriesChart({ data, isLoading }: GeoTimeSeriesChartProps) {
  const animation = useChartAnimation()
  const tz = useTimezone()

  const { chartData, top5 } = useMemo(() => {
    // Sum request_count per country across all timestamps
    const totals = new Map<string, { code: string; name: string; total: number }>()
    for (const point of data) {
      for (const c of point.countries) {
        const existing = totals.get(c.country_code)
        if (existing) {
          existing.total += c.request_count
        } else {
          totals.set(c.country_code, { code: c.country_code, name: c.country, total: c.request_count })
        }
      }
    }

    // Get top 5 by total
    const sorted = [...totals.values()].sort((a, b) => b.total - a.total).slice(0, 5)
    const top5Codes = sorted.map((s) => s.code)
    const nameMap = new Map(sorted.map((s) => [s.code, s.name]))

    // Transform data into flat records
    const chartData = data.map((point) => {
      const record: Record<string, string | number> = { timestamp: point.timestamp }
      const countryMap = new Map(point.countries.map((c) => [c.country_code, c.request_count]))
      for (const code of top5Codes) {
        record[code] = countryMap.get(code) ?? 0
      }
      return record
    })

    return {
      chartData,
      top5: sorted.map((s) => ({ code: s.code, name: nameMap.get(s.code) ?? s.code })),
    }
  }, [data])

  if (isLoading) {
    return <ChartSkeleton />
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Geographic Traffic Over Time</CardTitle>
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
        <CardTitle className="text-base">Geographic Traffic Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => formatDateTime(v, tz)}
              className="text-xs"
              tick={{ fill: 'var(--muted-foreground)' }}
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
              labelFormatter={(v) => formatDateTime(v as string, tz)}
            />
            <Legend />
            {top5.map((country, i) => (
              <Area
                key={country.code}
                type="monotone"
                dataKey={country.code}
                name={country.name}
                stackId="1"
                fill={COLORS[i]}
                stroke="var(--background)"
                strokeWidth={2}
                fillOpacity={0.8}
                {...animation}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
