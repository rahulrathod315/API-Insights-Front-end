import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { CardSkeleton } from '@/components/shared/loading-skeleton'
import { formatNumber, formatMs, formatPercent, formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { ComparisonData } from '../types'

interface PeriodComparisonProps {
  data: ComparisonData
  isLoading: boolean
  className?: string
}

interface MetricRow {
  label: string
  currentValue: number
  previousValue: number
  changePercent: number
  formatter: (v: number) => string
  invertColors?: boolean
  barColor: string
}

function getSemantics(change: number, invert?: boolean) {
  if (change === 0) return 'neutral' as const
  const positive = change > 0
  return (invert ? !positive : positive) ? ('improved' as const) : ('degraded' as const)
}

function PeriodComparison({ data, isLoading, className }: PeriodComparisonProps) {
  if (isLoading) {
    return <CardSkeleton className={className} />
  }

  const { current_period, previous_period, changes } = data

  const metrics: MetricRow[] = [
    {
      label: 'Total Requests',
      currentValue: current_period.metrics.request_count,
      previousValue: previous_period.metrics.request_count,
      changePercent: changes.request_count?.percent ?? 0,
      formatter: formatNumber,
      invertColors: false,
      barColor: 'var(--chart-1)',
    },
    {
      label: 'Error Rate',
      currentValue: current_period.metrics.error_rate,
      previousValue: previous_period.metrics.error_rate,
      changePercent: changes.error_rate?.percent ?? 0,
      formatter: formatPercent,
      invertColors: true,
      barColor: 'var(--destructive)',
    },
    {
      label: 'Avg Response Time',
      currentValue: current_period.metrics.avg_response_time,
      previousValue: previous_period.metrics.avg_response_time,
      changePercent: changes.avg_response_time?.percent ?? 0,
      formatter: formatMs,
      invertColors: true,
      barColor: 'var(--chart-3)',
    },
  ]

  return (
    <Card className={cn('flex flex-col overflow-hidden border-none shadow-md ring-1 ring-border', className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Period Comparison</CardTitle>
        <CardDescription>Current vs previous timespan performance</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-5">

          {/* Period date boxes — mirrors the Min / Max boxes on the endpoint Latency Profile */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Current Period
              </p>
              <p className="mt-1 text-xs font-semibold text-foreground">
                {formatDate(current_period.start)} – {formatDate(current_period.end)}
              </p>
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Previous Period
              </p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                {formatDate(previous_period.start)} – {formatDate(previous_period.end)}
              </p>
            </div>
          </div>

          {/* Metric rows — mirrors P50 / P90 / P95 / P99 rows on the endpoint Latency Profile */}
          <div className="space-y-4">
            {metrics.map((metric) => {
              const semantics = getSemantics(metric.changePercent, metric.invertColors)
              const isImproved = semantics === 'improved'
              const isDegraded = semantics === 'degraded'

              const ChangeIcon =
                metric.changePercent === 0
                  ? Minus
                  : metric.changePercent > 0
                    ? ArrowUp
                    : ArrowDown

              // Bar widths are proportional to the larger of the two values
              const maxVal = Math.max(metric.currentValue, metric.previousValue, 1)
              const currentPct = Math.max((metric.currentValue / maxVal) * 100, 2)
              const previousPct = Math.max((metric.previousValue / maxVal) * 100, 2)

              return (
                <div key={metric.label} className="space-y-2">

                  {/* Label row: name left, change badge + current value right */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'flex items-center gap-0.5 text-xs font-semibold',
                          isImproved && 'text-success',
                          isDegraded && 'text-destructive',
                          semantics === 'neutral' && 'text-muted-foreground'
                        )}
                      >
                        <ChangeIcon className="h-3 w-3" />
                        {Math.abs(metric.changePercent).toFixed(1)}%
                      </span>
                      <span className="font-mono text-sm font-bold text-foreground">
                        {metric.formatter(metric.currentValue)}
                      </span>
                    </div>
                  </div>

                  {/* Current bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Current
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isImproved && 'bg-success',
                          isDegraded && 'bg-destructive',
                          semantics === 'neutral' && 'bg-muted-foreground/60'
                        )}
                        style={{ width: `${currentPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Previous bar */}
                  <div className="flex items-center gap-2">
                    <span className="w-14 shrink-0 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Prev
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full bg-muted-foreground/30 transition-all duration-500"
                        style={{ width: `${previousPct}%` }}
                      />
                    </div>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {metric.formatter(metric.previousValue)}
                    </span>
                  </div>

                </div>
              )
            })}
          </div>

        </div>
      </CardContent>
    </Card>
  )
}

export { PeriodComparison }
export type { PeriodComparisonProps }
