import { Clock, Calendar, CalendarDays, CalendarRange } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'

type Granularity = 'hour' | 'day' | 'week' | 'month'

interface GranularitySelectorProps {
  value: Granularity
  onChange: (granularity: Granularity) => void
  disabled?: boolean
  className?: string
  variant?: 'select' | 'pills'
  autoSelect?: boolean
  days?: number
}

const GRANULARITY_OPTIONS: Array<{
  value: Granularity
  label: string
  icon: LucideIcon
  description: string
  recommendedForDays: number
}> = [
  {
    value: 'hour',
    label: 'Hourly',
    icon: Clock,
    description: 'Best for 1-2 days',
    recommendedForDays: 1,
  },
  {
    value: 'day',
    label: 'Daily',
    icon: Calendar,
    description: 'Best for 3-90 days',
    recommendedForDays: 30,
  },
  {
    value: 'week',
    label: 'Weekly',
    icon: CalendarDays,
    description: 'Best for 2-12 months',
    recommendedForDays: 90,
  },
  {
    value: 'month',
    label: 'Monthly',
    icon: CalendarRange,
    description: 'Best for 6+ months',
    recommendedForDays: 180,
  },
]

function getRecommendedGranularity(days?: number): Granularity {
  if (!days) return 'day'
  if (days <= 2) return 'hour'
  if (days <= 90) return 'day'
  if (days <= 180) return 'week'
  return 'month'
}

export function GranularitySelector({
  value,
  onChange,
  disabled = false,
  className,
  variant = 'select',
  autoSelect = false,
  days,
}: GranularitySelectorProps) {
  const recommended = autoSelect ? getRecommendedGranularity(days) : value

  if (variant === 'pills') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {GRANULARITY_OPTIONS.map((option) => {
          const Icon = option.icon
          const isSelected = value === option.value
          const isRecommended = recommended === option.value

          return (
            <TooltipProvider key={option.value}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onChange(option.value)}
                    disabled={disabled}
                    className={cn(
                      'relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                      disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{option.label}</span>
                    {isRecommended && !isSelected && (
                      <span className="absolute -right-1 -top-1 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{option.description}</p>
                  {isRecommended && <p className="mt-1 text-xs text-primary">Recommended</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Granularity" />
        </SelectTrigger>
        <SelectContent>
          {GRANULARITY_OPTIONS.map((option) => {
            const Icon = option.icon
            const isRecommended = recommended === option.value
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{option.label}</span>
                  {isRecommended && (
                    <span className="ml-auto text-xs text-primary">(Recommended)</span>
                  )}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
