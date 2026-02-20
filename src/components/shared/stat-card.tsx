import { cn } from '@/lib/utils/cn'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatCardProps {
  title: ReactNode
  value: ReactNode
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  iconClassName?: string
  className?: string
  /**
   * When true, treat increase as negative (red) and decrease as positive (green).
   * Useful for error-rate, response-time (lower is better) metrics.
   */
  invertTrend?: boolean
  subtitle?: string
  /** Optional description content displayed between title and value */
  description?: ReactNode
  /** Optional colored top border accent (CSS color value) */
  accentColor?: string
}

function StatCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  iconClassName,
  className,
  invertTrend = false,
  subtitle,
  description,
  accentColor,
}: StatCardProps) {
  const hasTrend = change !== undefined && change !== null
  const goingUp = hasTrend && change! > 0
  const goingDown = hasTrend && change! < 0
  const neutral = hasTrend && change === 0

  // Semantic positivity (may be inverted for metrics where lower = better)
  const isPositive = invertTrend ? goingDown : goingUp
  const isNegative = invertTrend ? goingUp : goingDown

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md',
        className
      )}
    >
      {/* Top accent bar */}
      {accentColor && (
        <div
          className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl"
          style={{ background: accentColor }}
        />
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className={cn(
          "text-xs font-semibold tracking-wider text-muted-foreground",
          typeof title === 'string' && "uppercase"
        )}>
          {title}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              iconClassName ?? 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <div className="mt-1 text-xs text-muted-foreground">{description}</div>
      )}

      {/* Value */}
      <div className="mt-3 flex items-end gap-2">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </div>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}

      {/* Trend indicator */}
      {hasTrend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {neutral ? (
            <>
              <Minus className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">No change</span>
            </>
          ) : goingUp ? (
            <>
              <TrendingUp
                className={cn('h-3.5 w-3.5', isPositive ? 'text-success' : 'text-destructive')}
              />
              <span
                className={cn(
                  'font-semibold',
                  isPositive ? 'text-success' : 'text-destructive'
                )}
              >
                +{Math.abs(change!).toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <TrendingDown
                className={cn('h-3.5 w-3.5', isNegative ? 'text-destructive' : 'text-success')}
              />
              <span
                className={cn(
                  'font-semibold',
                  isNegative ? 'text-destructive' : 'text-success'
                )}
              >
                -{Math.abs(change!).toFixed(1)}%
              </span>
            </>
          )}
          <span className="text-muted-foreground">{changeLabel}</span>
        </div>
      )}
    </div>
  )
}

export { StatCard }
export type { StatCardProps }
