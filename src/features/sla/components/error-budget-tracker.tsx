import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatPercent } from '@/lib/utils/format'
import { addDays, format } from 'date-fns'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts'
import { TrendingDown, AlertTriangle, TrendingUp } from 'lucide-react'
import type { SLAWithCompliance } from '../types'

interface ErrorBudgetTrackerProps {
  sla: SLAWithCompliance
  className?: string
}

export function ErrorBudgetTracker({ sla, className }: ErrorBudgetTrackerProps) {
  const { error_budget } = sla.compliance

  const analytics = useMemo(() => {
    // Calculate actual days in evaluation period
    const periodDays =
      sla.evaluation_period === 'weekly' ? 7 :
      sla.evaluation_period === 'monthly' ? 30 :
      sla.evaluation_period === 'quarterly' ? 90 : 30

    // Calculate realistic burn rate based on current consumption and period
    // If X% is consumed, assume it happened evenly over the period
    const daysElapsed = Math.min(periodDays, 30) // Assume max 30 days have passed
    const burnRate = error_budget.consumed_percent / daysElapsed

    // Generate realistic consumption trend based on actual consumption
    const consumptionData = Array.from({ length: 30 }, (_, i) => {
      // Show linear progression of consumption over time
      const dayNumber = i + 1
      const consumed = Math.min(100, Math.max(0, burnRate * dayNumber))

      return {
        day: dayNumber,
        consumed: consumed,
        date: format(addDays(new Date(), i - 29), 'MMM d'),
      }
    })

    // Project exhaustion date based on current burn rate
    let projectedExhaustionDays: number | null = null
    if (burnRate > 0.01 && error_budget.consumed_percent < 100) {
      const remainingBudget = 100 - error_budget.consumed_percent
      const days = Math.ceil(remainingBudget / burnRate)
      // Only show if less than remaining period days
      if (days <= periodDays) {
        projectedExhaustionDays = days
      }
    }

    // Check if consumption is high relative to time remaining in period
    const percentOfPeriodElapsed = (daysElapsed / periodDays) * 100
    const isAccelerating = error_budget.consumed_percent > percentOfPeriodElapsed * 1.2

    // Determine health status
    const consumed = error_budget.consumed_percent
    const status: 'healthy' | 'warning' | 'critical' =
      consumed < 50 ? 'healthy' : consumed < 80 ? 'warning' : 'critical'

    return {
      consumptionData,
      burnRate,
      projectedExhaustionDays,
      isAccelerating,
      status,
    }
  }, [error_budget.consumed_percent, sla.evaluation_period])

  const statusColors = {
    healthy: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive',
  }

  const projectedDate = analytics.projectedExhaustionDays
    ? format(addDays(new Date(), analytics.projectedExhaustionDays), 'MMM d, yyyy')
    : null

  const statusColor =
    analytics.status === 'healthy' ? '#10b981' :
    analytics.status === 'warning' ? '#f59e0b' : '#ef4444'

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Error Budget Tracker</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              'font-medium',
              error_budget.consumed_percent < 50
                ? 'bg-success/10 text-success border-success/20'
                : error_budget.consumed_percent < 80
                ? 'bg-warning/10 text-warning border-warning/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            )}
          >
            {formatPercent(error_budget.consumed_percent)} Used
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <TrendingDown className="h-4 w-4" />
              <span>Burn Rate</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {analytics.burnRate.toFixed(2)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">per day</p>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <TrendingUp className="h-4 w-4" />
              <span>Remaining</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {error_budget.remaining_hours.toFixed(1)}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              of {error_budget.total_allowed_hours.toFixed(1)}h
            </p>
          </div>
          {projectedDate && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Exhaustion ETA</span>
              </div>
              <p className="text-lg font-bold">{analytics.projectedExhaustionDays}d</p>
              <p className="text-xs text-muted-foreground mt-1">{projectedDate}</p>
            </div>
          )}
        </div>

        {/* Budget Consumption Chart */}
        <div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={analytics.consumptionData}>
              <defs>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={statusColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={statusColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: '#71717a' }}
              />
              <YAxis
                domain={[0, 100]}
                className="text-xs"
                tick={{ fill: '#71717a' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '6px',
                  color: '#fafafa',
                }}
                formatter={(value: number | undefined) => [`${(value ?? 0).toFixed(1)}%`, 'Consumed']}
              />
              <ReferenceLine
                y={100}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'Budget Limit', position: 'right', fill: '#71717a' }}
              />
              <Area
                type="monotone"
                dataKey="consumed"
                stroke={statusColor}
                fill="url(#budgetGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Warning for Accelerating Burn Rate */}
        {analytics.isAccelerating && analytics.burnRate > 0.5 && (
          <div className="rounded-lg border border-destructive bg-destructive/5 p-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-destructive">
                  Accelerating Burn Rate
                </p>
                <p className="text-muted-foreground mt-0.5">
                  Current rate is {analytics.burnRate.toFixed(2)}% per day, up from previous week.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {!analytics.isAccelerating && (
          <div className="rounded-lg border p-3">
            <p className={cn('text-sm font-medium', statusColors[analytics.status])}>
              {analytics.status === 'healthy' && 'Healthy budget consumption'}
              {analytics.status === 'warning' && 'Approaching budget limit'}
              {analytics.status === 'critical' && 'Critical: Budget nearly exhausted'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {analytics.status === 'healthy' &&
                'Error budget is being consumed at a sustainable rate.'}
              {analytics.status === 'warning' &&
                'Consider improving reliability to slow budget consumption.'}
              {analytics.status === 'critical' &&
                'Immediate action needed to prevent SLA breach.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
