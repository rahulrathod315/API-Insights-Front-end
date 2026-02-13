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
import { useChartAnimation } from '@/lib/animation'
import { formatNumber, formatPercent } from '@/lib/utils/format'

interface StatusBreakdownProps {
  data: Record<string, number>
  isLoading: boolean
}

function getStatusColor(category: string): string {
  if (category === '2xx') return 'var(--chart-2)'
  if (category === '3xx') return 'var(--chart-1)'
  if (category === '4xx') return 'var(--chart-3)'
  if (category === '5xx') return 'var(--chart-4)'
  return 'var(--chart-5)'
}

function getStatusLabel(category: string): string {
  if (category === '2xx') return '2xx (Success)'
  if (category === '3xx') return '3xx (Redirect)'
  if (category === '4xx') return '4xx (Client Error)'
  if (category === '5xx') return '5xx (Server Error)'
  return category
}

function StatusBreakdown({ data, isLoading }: StatusBreakdownProps) {
  const chartAnimation = useChartAnimation(600)
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([])

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
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">
            Status Codes
          </CardTitle>
          {baseData.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {baseData.map((item) => {
                const isHidden = hiddenCategories.includes(item.category)
                return (
                  <button
                    key={item.category}
                    type="button"
                    onClick={() => toggleCategory(item.category)}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-1 transition ${
                      isHidden ? 'opacity-50' : 'border-transparent bg-muted'
                    }`}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground">
            No data available for this range.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="name"
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
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { StatusBreakdown }
export type { StatusBreakdownProps }
