import { useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

interface DistributionData {
  name: string
  value: number
  color?: string
}

const COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--muted-foreground)',
]

export function ProjectDistributionChart({
  data,
  className,
}: {
  data: DistributionData[]
  className?: string
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (data.length === 0) {
    return (
      <Card className={cn('shadow-sm', className)}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Traffic Distribution</CardTitle>
          <CardDescription className="text-xs">Request volume breakdown by project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
            No data available.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Traffic Distribution</CardTitle>
        <CardDescription className="text-xs">Request volume breakdown by project</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
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
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || COLORS[index % COLORS.length]}
                    stroke="var(--background)"
                    strokeWidth={2}
                    opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.35}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]
                  const pct = total > 0 ? ((d.value as number) / total) * 100 : 0
                  const color = d.payload.color || COLORS[data.indexOf(d.payload) % COLORS.length]
                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg ring-1 ring-border">
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm font-medium text-popover-foreground">{d.name}</span>
                      </div>
                      <div className="ml-4 space-y-0.5">
                        <p className="text-xs text-muted-foreground">{formatNumber(d.value as number)} requests</p>
                        <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% of total</p>
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
                style={{
                  fill: hoveredIndex !== null
                    ? (data[hoveredIndex]?.color || COLORS[hoveredIndex % COLORS.length])
                    : 'var(--foreground)',
                  fontSize: 15,
                  fontWeight: 700,
                }}
              >
                {hoveredIndex !== null
                  ? data[hoveredIndex]?.name.length > 12
                    ? `${data[hoveredIndex].name.slice(0, 11)}…`
                    : data[hoveredIndex]?.name
                  : formatNumber(total)}
              </text>
              <text
                x="50%"
                y="57%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              >
                {hoveredIndex !== null
                  ? `${(total > 0 ? (data[hoveredIndex].value / total) * 100 : 0).toFixed(1)}%`
                  : 'requests'}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
