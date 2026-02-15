import { useState } from 'react'
import { format, parse, isValid } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils/cn'

interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  id?: string
  disabled?: boolean
}

function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  id,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const date = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const isValidDate = date && isValid(date)

  function handleSelect(selected: Date | undefined) {
    if (selected) {
      onChange?.(format(selected, 'yyyy-MM-dd'))
    } else {
      onChange?.('')
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            'justify-start text-left font-normal',
            !isValidDate && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {isValidDate ? format(date, 'MMM d, yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? date : undefined}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
export type { DatePickerProps }
