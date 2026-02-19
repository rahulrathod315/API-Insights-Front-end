import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils/cn'

interface EndpointMiniChartProps {
  data: number[]
  className?: string
}

export function EndpointMiniChart({ data, className }: EndpointMiniChartProps) {
  // Transform data into chart format
  const chartData = data.map((value, index) => ({ value, index }))

  // Determine trend direction
  const firstValue = data[0] ?? 0
  const lastValue = data[data.length - 1] ?? 0
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'neutral'

  const strokeColor = {
    up: 'var(--success)',
    down: 'var(--destructive)',
    neutral: 'var(--muted-foreground)',
  }[trend]

  if (data.length === 0 || data.every((v) => v === 0)) {
    return (
      <div className={cn('flex h-8 w-16 items-center justify-center text-xs text-muted-foreground', className)}>
        —
      </div>
    )
  }

  return (
    <div className={cn('h-8 w-16', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
