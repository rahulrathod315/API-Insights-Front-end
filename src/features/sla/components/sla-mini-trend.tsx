import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils/cn'

interface SLAMiniTrendProps {
  data: number[]
  target: number
  className?: string
}

export function SLAMiniTrend({ data, target, className }: SLAMiniTrendProps) {
  // Transform data into chart format
  const chartData = data.map((value, index) => ({ value, index }))

  // Determine if trending up or down
  const firstValue = data[0] ?? 0
  const lastValue = data[data.length - 1] ?? 0
  const trend = lastValue > firstValue ? 'up' : lastValue < firstValue ? 'down' : 'neutral'

  // Check if currently meeting target
  const meetingTarget = lastValue >= target

  const strokeColor = meetingTarget
    ? 'hsl(var(--success))'
    : 'hsl(var(--destructive))'

  if (data.length === 0) {
    return (
      <div className={cn('flex h-8 w-full items-center justify-center text-xs text-muted-foreground', className)}>
        —
      </div>
    )
  }

  return (
    <div className={cn('h-8 w-full', className)}>
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
