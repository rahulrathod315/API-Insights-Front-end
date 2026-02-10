import {
  Cell,
  Legend,
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
  if (isLoading) {
    return <ChartSkeleton />
  }

  const entries = Object.entries(data)
  const total = entries.reduce((sum, [, count]) => sum + count, 0)

  const chartData = entries.map(([category, count]) => ({
    category,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    name: getStatusLabel(category),
    fill: getStatusColor(category),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Status Codes
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
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
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export { StatusBreakdown }
export type { StatusBreakdownProps }
