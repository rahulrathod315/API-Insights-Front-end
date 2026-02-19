import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatChartTick, formatChartTooltip } from '@/lib/utils/format'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { cn } from '@/lib/utils/cn'
import type { GeoTimeSeriesPoint } from '../types'

interface GeoTimeSeriesChartProps {
  data: GeoTimeSeriesPoint[]
  isLoading?: boolean
  className?: string
  days?: number
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function GeoTimeSeriesChart({ data, isLoading, className, days }: GeoTimeSeriesChartProps) {
  const tz = useTimezone()

  const { chartData, topCountries } = useMemo(() => {
    if (!data.length) return { chartData: [], topCountries: [] }

    // 1. Calculate total requests per country to find top 5
    const countryTotals = new Map<string, { name: string, total: number }>()
    
    data.forEach(point => {
      point.countries.forEach(c => {
        const current = countryTotals.get(c.country_code) || { name: c.country, total: 0 }
        current.total += c.request_count
        countryTotals.set(c.country_code, current)
      })
    })

    const topCountries = Array.from(countryTotals.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([code, { name }]) => ({ code, name }))

    // 2. Transform data for Recharts (stacked area)
    const chartData = data.map(point => {
      const entry: any = { timestamp: point.timestamp }
      let otherTotal = 0
      
      point.countries.forEach(c => {
        if (topCountries.find(tc => tc.code === c.country_code)) {
          entry[c.country_code] = c.request_count
        } else {
          otherTotal += c.request_count
        }
      })
      
      // Ensure all top countries have a value (0 if missing)
      topCountries.forEach(tc => {
        if (entry[tc.code] === undefined) entry[tc.code] = 0
      })
      
      if (otherTotal > 0) {
        entry.other = otherTotal
      }
      
      return entry
    })

    return { chartData, topCountries }
  }, [data])

  if (isLoading) {
    return <ChartSkeleton className="h-[350px]" />
  }

  return (
    <Card className={cn("overflow-hidden border-none shadow-md ring-1 ring-border", className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Geographic Traffic Trends
        </CardTitle>
        <CardDescription>
          Request volume by top regions over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No geographic data available.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  {topCountries.map((country, index) => (
                    <linearGradient key={country.code} id={`geo-gradient-${country.code}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.1} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts: string) => formatChartTick(ts, days, tz)}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  minTickGap={30}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null
                    // Sort payload by value descending for better readability
                    const sortedPayload = [...payload].sort((a, b) => Number(b.value) - Number(a.value))
                    
                    return (
                      <div className="rounded-lg border bg-popover p-3 shadow-lg ring-1 ring-border animate-in fade-in-0 zoom-in-95">
                        <p className="mb-2 text-sm font-medium text-popover-foreground">
                          {formatChartTooltip(label as string, tz)}
                        </p>
                        <div className="space-y-1">
                          {sortedPayload.map((entry: any) => (
                            <div key={entry.name} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-2 w-2 rounded-full" 
                                  style={{ backgroundColor: entry.color }} 
                                />
                                <span className="text-xs text-muted-foreground">{entry.name}</span>
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                {formatNumber(entry.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }}
                  cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ paddingTop: '20px' }}
                />
                {topCountries.map((country, index) => (
                  <Area
                    key={country.code}
                    type="monotone"
                    dataKey={country.code}
                    name={country.name}
                    stackId="1"
                    stroke={COLORS[index % COLORS.length]}
                    fill={`url(#geo-gradient-${country.code})`}
                    fillOpacity={1}
                    animationDuration={1000}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
