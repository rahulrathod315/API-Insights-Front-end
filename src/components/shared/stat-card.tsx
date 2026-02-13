import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { ArrowDown, ArrowUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  iconClassName?: string
  className?: string
}

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconClassName,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0
  const isNegative = change !== undefined && change < 0

  return (
    <Card className={cn('relative overflow-hidden transition-shadow duration-200 hover:shadow-md', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className={cn('rounded-md p-2', iconClassName ?? 'bg-muted text-muted-foreground')}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
        {change !== undefined && (
          <div className="mt-2 flex items-center gap-1 text-sm">
            {isPositive && (
              <ArrowUp className="h-3.5 w-3.5 text-success" />
            )}
            {isNegative && (
              <ArrowDown className="h-3.5 w-3.5 text-destructive" />
            )}
            <span
              className={cn(
                'font-medium',
                isPositive && 'text-success',
                isNegative && 'text-destructive'
              )}
            >
              {Math.abs(change).toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="text-muted-foreground">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { StatCard }
export type { StatCardProps }
