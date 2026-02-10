import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatMs, formatPercent } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { ComparisonData } from '../types'

interface PeriodComparisonProps {
  data: ComparisonData
  isLoading: boolean
}

interface MetricRow {
  label: string
  currentValue: string
  previousValue: string
  changePercent: number
  invertColors?: boolean
}

function getChangeIcon(change: number) {
  if (change > 0) return ArrowUp
  if (change < 0) return ArrowDown
  return Minus
}

function PeriodComparison({ data, isLoading }: PeriodComparisonProps) {
  if (isLoading) {
    return <CardSkeleton />
  }

  const { current_period, previous_period, changes } = data

  const metrics: MetricRow[] = [
    {
      label: 'Total Requests',
      currentValue: formatNumber(current_period.metrics.request_count),
      previousValue: formatNumber(previous_period.metrics.request_count),
      changePercent: changes.request_count?.percent ?? 0,
    },
    {
      label: 'Error Rate',
      currentValue: formatPercent(current_period.metrics.error_rate),
      previousValue: formatPercent(previous_period.metrics.error_rate),
      changePercent: changes.error_rate?.percent ?? 0,
      invertColors: true,
    },
    {
      label: 'Avg Response Time',
      currentValue: formatMs(current_period.metrics.avg_response_time),
      previousValue: formatMs(previous_period.metrics.avg_response_time),
      changePercent: changes.avg_response_time?.percent ?? 0,
      invertColors: true,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Period Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Header row */}
          <div className="grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground">
            <span>Metric</span>
            <span className="text-right">Current</span>
            <span className="text-right">Previous</span>
            <span className="text-right">Change</span>
          </div>

          {metrics.map((metric) => {
            const ChangeIcon = getChangeIcon(metric.changePercent)
            const isImproved = metric.invertColors
              ? metric.changePercent < 0
              : metric.changePercent > 0
            const isDegraded = metric.invertColors
              ? metric.changePercent > 0
              : metric.changePercent < 0

            return (
              <div
                key={metric.label}
                className="grid grid-cols-4 items-center gap-4 rounded-md py-2 text-sm"
              >
                <span className="font-medium">{metric.label}</span>
                <span className="text-right tabular-nums">
                  {metric.currentValue}
                </span>
                <span className="text-right tabular-nums text-muted-foreground">
                  {metric.previousValue}
                </span>
                <div className="flex items-center justify-end gap-1">
                  <ChangeIcon
                    className={cn(
                      'h-3.5 w-3.5',
                      isImproved && 'text-success',
                      isDegraded && 'text-destructive',
                      !isImproved && !isDegraded && 'text-muted-foreground'
                    )}
                  />
                  <span
                    className={cn(
                      'tabular-nums text-sm font-medium',
                      isImproved && 'text-success',
                      isDegraded && 'text-destructive',
                      !isImproved && !isDegraded && 'text-muted-foreground'
                    )}
                  >
                    {Math.abs(metric.changePercent).toFixed(1)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export { PeriodComparison }
export type { PeriodComparisonProps }
