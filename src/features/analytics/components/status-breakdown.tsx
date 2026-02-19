import { useMemo, useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface StatusBreakdownProps {
  data: Record<string, number>
  isLoading: boolean
  className?: string
}

function getStatusColor(category: string): string {
  if (category === '2xx' || category.startsWith('2')) return 'var(--success)'
  if (category === '3xx' || category.startsWith('3')) return 'var(--chart-5)'
  if (category === '4xx' || category.startsWith('4')) return 'var(--warning)'
  if (category === '5xx' || category.startsWith('5')) return 'var(--destructive)'
  return 'var(--primary)'
}

function getStatusLabel(category: string): string {
  if (category === '2xx') return 'Success'
  if (category === '3xx') return 'Redirect'
  if (category === '4xx') return 'Client Error'
  if (category === '5xx') return 'Server Error'
  if (category.startsWith('2')) return `${category} (Success)`
  if (category.startsWith('3')) return `${category} (Redirect)`
  if (category.startsWith('4')) return `${category} (Client Error)`
  if (category.startsWith('5')) return `${category} (Server Error)`
  return category
}

export function StatusBreakdown({ data, isLoading, className }: StatusBreakdownProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const entries = Object.entries(data)
  const total = entries.reduce((sum, [, count]) => sum + count, 0)

  const chartData = useMemo(() => {
    return entries
      .map(([category, count]) => ({
        category,
        count,
        name: getStatusLabel(category),
        fill: getStatusColor(category),
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }, [entries, total])

  if (isLoading) {
    return <ChartSkeleton className="h-[350px]" />
  }

  const hovered = hoveredIndex !== null ? chartData[hoveredIndex] : null

  return (
    <Card className={cn('overflow-hidden border-none shadow-md ring-1 ring-border', className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Status Codes</CardTitle>
        <CardDescription>Response status distribution</CardDescription>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No data available.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="name"
                  cornerRadius={3}
                  isAnimationActive={false}
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      stroke="var(--background)"
                      strokeWidth={2}
                      opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.35}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg ring-1 ring-border">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: d.fill }}
                          />
                          <span className="text-sm font-medium text-popover-foreground">{d.name}</span>
                        </div>
                        <div className="ml-4 space-y-0.5">
                          <p className="text-xs text-muted-foreground">{formatNumber(d.count)} requests</p>
                          <p className="text-xs text-muted-foreground">{d.percentage.toFixed(1)}% of total</p>
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
                  style={{ fill: hovered ? hovered.fill : 'var(--foreground)', fontSize: 15, fontWeight: 700 }}
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
                  {hovered ? `${hovered.percentage.toFixed(1)}%` : 'total'}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
