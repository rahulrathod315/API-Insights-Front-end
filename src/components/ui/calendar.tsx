import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { buttonVariants } from '@/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-4', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center h-10',
        caption_label: 'text-base font-semibold',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute left-1 top-0 h-9 w-9 bg-transparent p-0 opacity-60 hover:opacity-100 z-10'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute right-1 top-0 h-9 w-9 bg-transparent p-0 opacity-60 hover:opacity-100 z-10'
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday:
          'text-muted-foreground rounded-md w-10 h-10 flex items-center justify-center font-medium text-xs',
        week: 'flex w-full mt-1',
        day: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary/10 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-primary/5',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-10 w-10 p-0 font-normal text-sm hover:bg-primary/10 hover:text-primary aria-selected:opacity-100'
        ),
        range_start: 'day-range-start rounded-l-md',
        range_end: 'day-range-end rounded-r-md',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
        today: 'bg-accent text-accent-foreground font-bold',
        outside:
          'day-outside text-muted-foreground/40 aria-selected:bg-primary/5 aria-selected:text-muted-foreground',
        disabled: 'text-muted-foreground/30 cursor-not-allowed',
        range_middle:
          'aria-selected:bg-primary/10 aria-selected:text-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
        },
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'

export { Calendar }
