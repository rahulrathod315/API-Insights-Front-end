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
} from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber } from '@/lib/utils/format'

interface UserAgentBreakdownProps {
  data: Array<{ name: string; count: number }>
  isLoading: boolean
}

const chartColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function UserAgentBreakdown({ data, isLoading }: UserAgentBreakdownProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([])

  const total = data.reduce((sum, item) => sum + item.count, 0)

  const baseData = useMemo(
    () =>
      data.map((item, index) => ({
        name: item.name,
        count: item.count,
        fill: chartColors[index % chartColors.length],
      })),
    [data]
  )

  const visibleData = useMemo(() => {
    if (hiddenKeys.length === 0) return baseData
    return baseData.filter((item) => !hiddenKeys.includes(item.name))
  }, [baseData, hiddenKeys])

  const visibleTotal = visibleData.reduce((sum, item) => sum + item.count, 0)

  const chartData = useMemo(
    () =>
      visibleData.map((item) => ({
        ...item,
        percentage: visibleTotal > 0 ? (item.count / visibleTotal) * 100 : 0,
      })),
    [visibleData, visibleTotal]
  )

  const hovered = hoveredIndex !== null ? chartData[hoveredIndex] : null

  if (isLoading) {
    return <ChartSkeleton />
  }

  function toggleKey(name: string) {
    setHiddenKeys((prev) => {
      const next = prev.includes(name) ? prev.filter((k) => k !== name) : [...prev, name]
      return next.length === baseData.length ? [] : next
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">User Agents</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No data available for this range.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    cornerRadius={3}
                    dataKey="count"
                    nameKey="name"
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
                        onClick={() => toggleKey(entry.name)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const item = payload[0].payload as (typeof chartData)[number]
                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 shadow-lg ring-1 ring-border">
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: item.fill }}
                            />
                            <span className="text-sm font-medium text-popover-foreground">
                              {item.name}
                            </span>
                          </div>
                          <div className="ml-4 space-y-0.5">
                            <p className="text-xs text-muted-foreground">
                              {formatNumber(item.count)} requests
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.percentage.toFixed(1)}% of visible
                            </p>
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
                      fill: hovered ? hovered.fill : 'var(--foreground)',
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    {hovered
                      ? hovered.name.length > 14
                        ? `${hovered.name.slice(0, 13)}…`
                        : hovered.name
                      : formatNumber(visibleTotal)}
                  </text>
                  <text
                    x="50%"
                    y="57%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  >
                    {hovered ? `${hovered.percentage.toFixed(1)}%` : 'requests'}
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Clickable legend */}
            {baseData.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs">
                {baseData.map((item) => {
                  const isHidden = hiddenKeys.includes(item.name)
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleKey(item.name)}
                      className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-opacity ${
                        isHidden ? 'opacity-35' : 'opacity-100'
                      }`}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { UserAgentBreakdown }
export type { UserAgentBreakdownProps }
