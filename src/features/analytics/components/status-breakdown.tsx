import { useMemo, useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartSkeleton } from '@/components/shared/loading-skeleton'
import { useChartAnimation } from '@/lib/animation'
import { formatNumber, formatPercent } from '@/lib/utils/format'

interface StatusBreakdownProps {
  data: Record<string, number>
  isLoading: boolean
}

function getStatusColor(category: string): string {
  if (category === '2xx' || category.startsWith('2')) return 'var(--chart-3)'
  if (category === '3xx' || category.startsWith('3')) return 'var(--chart-5)'
  if (category === '4xx' || category.startsWith('4')) return 'var(--chart-1)'
  if (category === '5xx' || category.startsWith('5')) return 'var(--chart-2)'
  return 'var(--chart-1)'
}

function getStatusLabel(category: string): string {
  if (category === '2xx') return '2xx (Success)'
  if (category === '3xx') return '3xx (Redirect)'
  if (category === '4xx') return '4xx (Client Error)'
  if (category === '5xx') return '5xx (Server Error)'
  if (category.startsWith('2')) return `${category} (Success)`
  if (category.startsWith('3')) return `${category} (Redirect)`
  if (category.startsWith('4')) return `${category} (Client Error)`
  if (category.startsWith('5')) return `${category} (Server Error)`
  return category
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent,
  } = props

  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="var(--foreground)" className="text-sm font-semibold">
        {payload.name.split(' ')[0]}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--muted-foreground)" className="text-xs">
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.85}
      />
    </g>
  )
}

function StatusBreakdown({ data, isLoading }: StatusBreakdownProps) {
  const chartAnimation = useChartAnimation(600)
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  const entries = Object.entries(data)
  const total = entries.reduce((sum, [, count]) => sum + count, 0)

  const baseData = entries.map(([category, count]) => ({
    category,
    count,
    name: getStatusLabel(category),
    fill: getStatusColor(category),
  }))

  const visibleData = useMemo(() => {
    if (hiddenCategories.length === 0) return baseData
    return baseData.filter((item) => !hiddenCategories.includes(item.category))
  }, [baseData, hiddenCategories])

  const visibleTotal = visibleData.reduce((sum, item) => sum + item.count, 0)
  const chartData = visibleData.map((item) => ({
    ...item,
    percentage: visibleTotal > 0 ? (item.count / visibleTotal) * 100 : 0,
  }))

  if (isLoading) {
    return <ChartSkeleton />
  }

  function toggleCategory(category: string) {
    setHiddenCategories((prev) => {
      const next = prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
      return next.length === baseData.length ? [] : next
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Status Codes
        </CardTitle>
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
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="count"
                    nameKey="name"
                    stroke="var(--background)"
                    strokeWidth={2}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(undefined)}
                    {...chartAnimation}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        onClick={() => toggleCategory(entry.category)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const item = payload[0].payload as (typeof chartData)[number]
                      return (
                        <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
                          <p className="font-medium">{item.name}</p>
                          <p>
                            Count:{' '}
                            <span className="font-semibold">
                              {formatNumber(item.count)}
                            </span>
                          </p>
                          <p>
                            Share:{' '}
                            <span className="font-semibold">
                              {formatPercent(item.percentage)}
                            </span>
                          </p>
                        </div>
                      )
                    }}
                  />
                  {/* Center total label (only when no segment is active) */}
                  {activeIndex === undefined && (
                    <text
                      x="50%"
                      y="48%"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-lg font-bold"
                      fill="var(--foreground)"
                    >
                      {formatNumber(visibleTotal)}
                    </text>
                  )}
                  {activeIndex === undefined && (
                    <text
                      x="50%"
                      y="58%"
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="text-[11px]"
                      fill="var(--muted-foreground)"
                    >
                      requests
                    </text>
                  )}
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend below chart */}
            {baseData.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs">
                {baseData.map((item) => {
                  const isHidden = hiddenCategories.includes(item.category)
                  return (
                    <button
                      key={item.category}
                      type="button"
                      onClick={() => toggleCategory(item.category)}
                      className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition ${
                        isHidden ? 'opacity-40' : 'opacity-100'
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

export { StatusBreakdown }
export type { StatusBreakdownProps }
