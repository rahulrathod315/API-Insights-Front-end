import { ArrowDown, ArrowUp, Minus, Activity, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedNumber } from '@/components/animation/animated-number'
import { cn } from '@/lib/utils/cn'
import { formatNumber, formatPercent, formatMs } from '@/lib/utils/format'
import type { LucideIcon } from 'lucide-react'

interface MetricData {
  id: string
  label: string
  icon: LucideIcon
  currentValue: number
  previousValue?: number
  changePercent?: number
  invertColors?: boolean
  isAvailable: boolean
  chartId?: string
  formatter: (value: number) => string
  unit?: string
}

interface ComparisonSummaryHeaderProps {
  requestCount?: { current: number; previous?: number; change?: number }
  errorRate?: { current: number; previous?: number; change?: number }
  p95Latency?: { current: number; previous?: number; change?: number }
  slaCompliance?: { current: number; previous?: number; change?: number }
  periodLabel?: string
  isLoading?: boolean
  className?: string
}

function getChangeIcon(change: number | undefined) {
  if (change === undefined || change === 0) return Minus
  if (change > 0) return ArrowUp
  return ArrowDown
}

function getChangeColor(change: number | undefined, invertColors: boolean) {
  if (change === undefined || change === 0) return 'text-muted-foreground'

  const isPositiveChange = change > 0
  const isImprovement = invertColors ? !isPositiveChange : isPositiveChange

  return isImprovement ? 'text-success' : 'text-destructive'
}

function formatChangePercent(change: number | undefined): string {
  if (change === undefined) return '—'
  const absValue = Math.abs(change)
  if (absValue > 999) return '+999%'
  if (absValue < 0.1 && absValue > 0) return '<0.1%'
  return `${absValue.toFixed(1)}%`
}

export function ComparisonSummaryHeader({
  requestCount,
  errorRate,
  p95Latency,
  slaCompliance,
  periodLabel,
  isLoading = false,
  className,
}: ComparisonSummaryHeaderProps) {
  const metrics: MetricData[] = [
    {
      id: 'requests',
      label: 'Total Requests',
      icon: Activity,
      currentValue: requestCount?.current ?? 0,
      previousValue: requestCount?.previous,
      changePercent: requestCount?.change,
      invertColors: false,
      isAvailable: !!requestCount,
      chartId: 'chart-requests',
      formatter: formatNumber,
    },
    {
      id: 'error-rate',
      label: 'Error Rate',
      icon: AlertTriangle,
      currentValue: errorRate?.current ?? 0,
      previousValue: errorRate?.previous,
      changePercent: errorRate?.change,
      invertColors: true,
      isAvailable: !!errorRate,
      chartId: 'chart-error-rate',
      formatter: formatPercent,
    },
    {
      id: 'p95-latency',
      label: 'P95 Latency',
      icon: Zap,
      currentValue: p95Latency?.current ?? 0,
      previousValue: p95Latency?.previous,
      changePercent: p95Latency?.change,
      invertColors: true,
      isAvailable: !!p95Latency,
      chartId: 'chart-performance',
      formatter: formatMs,
    },
    {
      id: 'sla',
      label: 'SLA Compliance',
      icon: CheckCircle2,
      currentValue: slaCompliance?.current ?? 0,
      previousValue: slaCompliance?.previous,
      changePercent: slaCompliance?.change,
      invertColors: false,
      isAvailable: !!slaCompliance,
      chartId: 'chart-sla',
      formatter: formatPercent,
    },
  ].filter(m => m.isAvailable)


  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <Skeleton className="mb-3 h-4 w-48" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (metrics.length === 0) {
    return null
  }

  const gridCols = metrics.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {periodLabel && (
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">{periodLabel}</p>
          </div>
        )}

        <div className={cn('grid grid-cols-2 gap-3', gridCols)}>
          {metrics.map((metric) => {
            const ChangeIcon = getChangeIcon(metric.changePercent)
            const changeColor = getChangeColor(metric.changePercent, metric.invertColors ?? false)
            const hasChange = metric.changePercent !== undefined && metric.previousValue !== undefined

            return (
              <TooltipProvider key={metric.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="relative rounded-md bg-muted/30 p-3 text-left"
                      aria-label={`${metric.label}. Current: ${metric.formatter(metric.currentValue)}${hasChange ? `, ${metric.changePercent! > 0 ? 'up' : 'down'} ${formatChangePercent(metric.changePercent)} from previous period` : ''}`}
                    >
                      {/* Icon + Label */}
                      <div className="flex items-center gap-2">
                        <metric.icon className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {metric.label}
                        </span>
                      </div>

                      {/* Current Value */}
                      <div className="mt-1">
                        <AnimatedNumber
                          value={metric.currentValue}
                          formatter={metric.formatter}
                          className="text-2xl font-bold tabular-nums tracking-tight"
                        />
                      </div>

                      {/* Change Indicator */}
                      {hasChange && (
                        <div className="mt-1 flex items-center gap-1">
                          <ChangeIcon className={cn('h-3.5 w-3.5', changeColor)} />
                          <span className={cn('text-sm font-medium tabular-nums', changeColor)}>
                            {formatChangePercent(metric.changePercent)}
                          </span>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">{metric.label}</p>
                      <p className="text-xs">
                        Current: {metric.formatter(metric.currentValue)}
                      </p>
                      {metric.previousValue !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Previous: {metric.formatter(metric.previousValue)}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
