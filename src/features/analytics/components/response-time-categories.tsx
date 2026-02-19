import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatPercent } from '@/lib/utils/format'
import { Zap, TrendingUp, AlertTriangle, AlertOctagon } from 'lucide-react'
import type { TimeSeriesPoint } from '../types'

interface ResponseTimeCategoriesProps {
  data: TimeSeriesPoint[]
  isLoading: boolean
}

interface CategoryData {
  name: string
  value: number
  percentage: number
  color: string
  icon: typeof Zap
  threshold: string
}

const CATEGORIES = {
  fast: {
    name: 'Fast',
    color: 'var(--success)',
    icon: Zap,
    threshold: '< 100ms',
  },
  normal: {
    name: 'Normal',
    color: 'var(--warning)',
    icon: TrendingUp,
    threshold: '100–500ms',
  },
  slow: {
    name: 'Slow',
    color: 'var(--chart-1)',
    icon: AlertTriangle,
    threshold: '500–1000ms',
  },
  verySlow: {
    name: 'Very Slow',
    color: 'var(--destructive)',
    icon: AlertOctagon,
    threshold: '> 1000ms',
  },
}

export function ResponseTimeCategories({ data, isLoading }: ResponseTimeCategoriesProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const categories = useMemo(() => {
    if (data.length === 0) return []

    let fast = 0
    let normal = 0
    let slow = 0
    let verySlow = 0

    data.forEach((point) => {
      const avgTime = point.avg_response_time
      const count = point.request_count

      if (avgTime < 100) {
        fast += count
      } else if (avgTime < 500) {
        normal += count
      } else if (avgTime < 1000) {
        slow += count
      } else {
        verySlow += count
      }
    })

    const total = fast + normal + slow + verySlow
    if (total === 0) return []

    const result: CategoryData[] = [
      { name: CATEGORIES.fast.name, value: fast, percentage: (fast / total) * 100, color: CATEGORIES.fast.color, icon: CATEGORIES.fast.icon, threshold: CATEGORIES.fast.threshold },
      { name: CATEGORIES.normal.name, value: normal, percentage: (normal / total) * 100, color: CATEGORIES.normal.color, icon: CATEGORIES.normal.icon, threshold: CATEGORIES.normal.threshold },
      { name: CATEGORIES.slow.name, value: slow, percentage: (slow / total) * 100, color: CATEGORIES.slow.color, icon: CATEGORIES.slow.icon, threshold: CATEGORIES.slow.threshold },
      { name: CATEGORIES.verySlow.name, value: verySlow, percentage: (verySlow / total) * 100, color: CATEGORIES.verySlow.color, icon: CATEGORIES.verySlow.icon, threshold: CATEGORIES.verySlow.threshold },
    ]

    return result.filter((cat) => cat.value > 0)
  }, [data])

  if (isLoading) {
    return <CardSkeleton />
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Response Time Distribution</CardTitle>
          <CardDescription>Breakdown by performance category</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const total = categories.reduce((sum, cat) => sum + cat.value, 0)
  const hovered = hoveredIndex !== null ? categories[hoveredIndex] : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Response Time Distribution</CardTitle>
        <CardDescription>Breakdown by performance category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Donut chart — unified sizing */}
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  cornerRadius={3}
                  dataKey="value"
                  isAnimationActive={false}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {categories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="var(--background)"
                      strokeWidth={2}
                      opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.35}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload as CategoryData
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg ring-1 ring-border">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-sm font-medium text-popover-foreground">{d.name}</span>
                        </div>
                        <div className="ml-4 space-y-0.5">
                          <p className="text-xs text-muted-foreground">{d.threshold}</p>
                          <p className="text-xs text-muted-foreground">{formatNumber(d.value)} requests</p>
                          <p className="text-xs text-muted-foreground">{formatPercent(d.percentage)} of total</p>
                        </div>
                      </div>
                    )
                  }}
                />
                {/* Center label */}
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fill: hovered ? hovered.color : 'var(--foreground)', fontSize: 15, fontWeight: 700 }}
                >
                  {hovered ? hovered.name : formatNumber(total)}
                </text>
                <text
                  x="50%"
                  y="57%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                >
                  {hovered ? `${formatPercent(hovered.percentage)}` : 'total'}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.name}
                  className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="rounded-md p-2"
                      style={{ backgroundColor: `color-mix(in srgb, ${category.color} 15%, transparent)` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: category.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{category.name}</p>
                      <p className="text-sm font-semibold">{formatPercent(category.percentage)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between border-t pt-2">
                    <span className="text-xs text-muted-foreground">{category.threshold}</span>
                    <span className="text-xs font-medium tabular-nums">
                      {formatNumber(category.value)} req
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Requests</span>
              <span className="text-lg font-bold tabular-nums">{formatNumber(total)}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fast + Normal:</span>
                <span className="font-medium text-success">
                  {formatPercent(
                    (categories.find((c) => c.name === 'Fast')?.percentage || 0) +
                      (categories.find((c) => c.name === 'Normal')?.percentage || 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slow + Very Slow:</span>
                <span className="font-medium text-destructive">
                  {formatPercent(
                    (categories.find((c) => c.name === 'Slow')?.percentage || 0) +
                      (categories.find((c) => c.name === 'Very Slow')?.percentage || 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
