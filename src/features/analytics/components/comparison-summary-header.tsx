import { ArrowDown, ArrowUp, Minus, Activity, AlertTriangle, Zap, CheckCircle2, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AnimatedNumber } from '@/components/animation/animated-number'
import { StaggerGroup, StaggerItem } from '@/components/animation/stagger-group'
import { cn } from '@/lib/utils/cn'
import { formatNumber, formatPercent, formatMs } from '@/lib/utils/format'
import { StatCard } from '@/components/shared/stat-card'
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
  formatter: (value: number) => string
  titleColor: string
  dotColor: string
}

interface ComparisonSummaryHeaderProps {
  requestCount?: { current: number; previous?: number; change?: number }
  successRate?: { current: number; previous?: number; change?: number }
  errorRate?: { current: number; previous?: number; change?: number }
  p95Latency?: { current: number; previous?: number; change?: number }
  slaCompliance?: { current: number; previous?: number; change?: number }
  periodLabel?: string
  isLoading?: boolean
  className?: string
}

function getChangeColor(change: number | undefined, invertColors: boolean) {
  if (change === undefined || change === 0) return 'neutral' as const
  const isPositiveChange = change > 0
  const isImprovement = invertColors ? !isPositiveChange : isPositiveChange
  return isImprovement ? ('improved' as const) : ('degraded' as const)
}

function formatChangePercent(change: number | undefined): string {
  if (change === undefined) return '—'
  const absValue = Math.abs(change)
  if (absValue > 999) return '+999%'
  if (absValue < 0.1 && absValue > 0) return '<0.1%'
  const sign = change > 0 ? '+' : '−'
  return `${sign}${absValue.toFixed(1)}%`
}

export function ComparisonSummaryHeader({
  requestCount,
  successRate,
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
      formatter: formatNumber,
      titleColor: 'text-primary',
      dotColor: 'bg-primary',
    },
    {
      id: 'success-rate',
      label: 'Success Rate',
      icon: CheckCircle2,
      currentValue: successRate?.current ?? 0,
      previousValue: successRate?.previous,
      changePercent: successRate?.change,
      invertColors: false,
      isAvailable: !!successRate,
      formatter: formatPercent,
      titleColor: 'text-success',
      dotColor: 'bg-success',
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
      formatter: formatPercent,
      titleColor: 'text-destructive',
      dotColor: 'bg-destructive',
    },
    {
      id: 'p95-latency',
      label: 'Avg Response Time',
      icon: Zap,
      currentValue: p95Latency?.current ?? 0,
      previousValue: p95Latency?.previous,
      changePercent: p95Latency?.change,
      invertColors: true,
      isAvailable: !!p95Latency,
      formatter: formatMs,
      titleColor: 'text-warning',
      dotColor: 'bg-warning',
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
      formatter: formatPercent,
      titleColor: 'text-success',
      dotColor: 'bg-success',
    },
  ].filter(m => m.isAvailable)

  if (isLoading) {
    return (
      <Card className={cn('shadow-sm', className)}>
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-1 h-3 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-background p-5">
                <Skeleton className="h-3 w-24" />
                <div className="mt-3 flex items-baseline gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Skeleton className="h-1.5 w-1.5 rounded-full" />
                  <Skeleton className="h-2.5 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (metrics.length === 0) return null

  const gridCols =
    metrics.length === 2
      ? 'md:grid-cols-2'
      : metrics.length === 3
        ? 'md:grid-cols-3'
        : 'md:grid-cols-4'

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Period Comparison</CardTitle>

        {/* Reporting window row — same pattern as dashboard page */}
        {periodLabel && (() => {
          const [currentRange, previousRange] = periodLabel.split(' vs ')
          return (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                Reporting window:{' '}
                <span className="font-medium text-foreground">{currentRange}</span>
                {previousRange && (
                  <>
                    {' '}vs{' '}
                    <span className="font-medium text-foreground">{previousRange}</span>
                  </>
                )}
              </span>
            </div>
          )
        })()}
      </CardHeader>

      <CardContent>
        <StaggerGroup className={cn('grid gap-4', gridCols)}>
          {metrics.map((metric) => {
            const semantics = getChangeColor(metric.changePercent, metric.invertColors ?? false)
            const isImproved = semantics === 'improved'
            const isDegraded = semantics === 'degraded'
            const hasChange = metric.changePercent !== undefined && metric.previousValue !== undefined

            const ChangeIcon =
              !hasChange || metric.changePercent === 0
                ? Minus
                : metric.changePercent! > 0
                  ? ArrowUp
                  : ArrowDown

            return (
              <StaggerItem key={metric.id}>
                <StatCard
                  title={
                    <span className={cn('text-xs font-bold uppercase tracking-wider', metric.titleColor)}>
                      {metric.label}
                    </span>
                  }
                  value={
                    <div className="flex items-baseline gap-2">
                      <AnimatedNumber
                        value={metric.currentValue}
                        formatter={metric.formatter}
                        className="text-2xl font-bold tabular-nums tracking-tight text-foreground"
                      />
                      {hasChange && (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset',
                            isImproved && 'bg-success/10 text-success ring-success/20',
                            isDegraded && 'bg-destructive/10 text-destructive ring-destructive/20',
                            semantics === 'neutral' && 'bg-muted text-muted-foreground ring-border'
                          )}
                        >
                          {formatChangePercent(metric.changePercent)}
                        </span>
                      )}
                    </div>
                  }
                  description={
                    metric.previousValue !== undefined ? (
                      <div className="flex items-center gap-1.5">
                        <div className={cn('h-1.5 w-1.5 rounded-full', metric.dotColor)} />
                        <span className="text-[10px] font-medium uppercase text-muted-foreground">
                          vs {metric.formatter(metric.previousValue)} prev period
                        </span>
                      </div>
                    ) : undefined
                  }
                  className="bg-background"
                />
              </StaggerItem>
            )
          })}
        </StaggerGroup>
      </CardContent>
    </Card>
  )
}
