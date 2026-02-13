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
  const chartAnimation = useChartAnimation(600)
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([])

  const total = data.reduce((sum, item) => sum + item.count, 0)
  const baseData = data.map((item, index) => ({
    name: item.name,
    count: item.count,
    fill: chartColors[index % chartColors.length],
  }))

  const visibleData = useMemo(() => {
    if (hiddenKeys.length === 0) return baseData
    return baseData.filter((item) => !hiddenKeys.includes(item.name))
  }, [baseData, hiddenKeys])

  const visibleTotal = visibleData.reduce((sum, item) => sum + item.count, 0)
  const chartData = visibleData.map((item) => ({
    ...item,
    percentage: visibleTotal > 0 ? (item.count / visibleTotal) * 100 : 0,
  }))

  if (isLoading) {
    return <ChartSkeleton />
  }

  function toggleKey(name: string) {
    setHiddenKeys((prev) => {
      const next = prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
      return next.length === baseData.length ? [] : next
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">
            User Agents
          </CardTitle>
          {baseData.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {baseData.map((item) => {
                const isHidden = hiddenKeys.includes(item.name)
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => toggleKey(item.name)}
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

export { UserAgentBreakdown }
export type { UserAgentBreakdownProps }
