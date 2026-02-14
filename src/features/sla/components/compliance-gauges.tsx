import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { formatPercent, formatMs } from '@/lib/utils/format'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { Compliance } from '../types'

interface ComplianceGaugesProps {
  compliance: Compliance
}

function UptimeGauge({ uptime, target }: { uptime: number; target: number }) {
  const isMeeting = uptime >= target
  const data = [
    { name: 'uptime', value: uptime },
    { name: 'remaining', value: 100 - uptime },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-28 w-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={0}
                  dataKey="value"
                >
                  <Cell fill={isMeeting ? 'var(--chart-2)' : 'var(--chart-4)'} />
                  <Cell fill="var(--muted)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className={cn('text-2xl font-bold', isMeeting ? 'text-success' : 'text-destructive')}>
              {formatPercent(uptime)}
            </p>
            <p className="text-sm text-muted-foreground">Target: {formatPercent(target)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricBar({
  label,
  current,
  target,
  formatValue,
  isCompliant,
  invertComparison = false,
}: {
  label: string
  current: number
  target: number
  formatValue: (v: number) => string
  isCompliant: boolean
  invertComparison?: boolean
}) {
  const ratio = invertComparison
    ? target > 0 ? Math.min((current / target) * 100, 100) : 0
    : target > 0 ? Math.min((current / target) * 100, 100) : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className={cn('text-lg font-bold', isCompliant ? 'text-success' : 'text-destructive')}>
            {formatValue(current)}
          </span>
          <span className="text-sm text-muted-foreground">Target: {formatValue(target)}</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              isCompliant ? 'bg-success' : 'bg-destructive'
            )}
            style={{ width: `${ratio}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function ErrorBudgetBar({ budget }: { budget: Compliance['error_budget'] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Error Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">
            {budget.remaining_hours.toFixed(1)}h remaining
          </span>
          <span className="text-sm text-muted-foreground">
            {formatPercent(budget.consumed_percent)} used
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              budget.consumed_percent < 50
                ? 'bg-success'
                : budget.consumed_percent < 80
                  ? 'bg-warning'
                  : 'bg-destructive'
            )}
            style={{ width: `${Math.min(100, budget.consumed_percent)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Used: {budget.used_hours.toFixed(1)}h</span>
          <span>Total: {budget.total_allowed_hours.toFixed(1)}h</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ComplianceGauges({ compliance }: ComplianceGaugesProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <UptimeGauge uptime={compliance.uptime_percent} target={compliance.uptime_target} />

      {compliance.response_time && compliance.response_time.target_ms > 0 && (
        <MetricBar
          label={`Response Time (${compliance.response_time.percentile})`}
          current={compliance.response_time.current_ms}
          target={compliance.response_time.target_ms}
          formatValue={formatMs}
          isCompliant={compliance.response_time.is_compliant}
        />
      )}

      {compliance.error_rate && compliance.error_rate.target_percent > 0 && (
        <MetricBar
          label="Error Rate"
          current={compliance.error_rate.current_percent}
          target={compliance.error_rate.target_percent}
          formatValue={formatPercent}
          isCompliant={compliance.error_rate.is_compliant}
          invertComparison
        />
      )}

      <ErrorBudgetBar budget={compliance.error_budget} />
    </div>
  )
}

export { ComplianceGauges }
