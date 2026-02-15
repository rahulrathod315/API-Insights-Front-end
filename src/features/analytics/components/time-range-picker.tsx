import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import type { AnalyticsParams } from '../types'

interface TimeRangePickerProps {
  value: AnalyticsParams
  onChange: (params: AnalyticsParams) => void
}

type DaysOption = '1' | '7' | '30' | '90' | 'custom'

const DAYS_LABELS: Record<DaysOption, string> = {
  '1': 'Last 24 Hours',
  '7': 'Last 7 Days',
  '30': 'Last 30 Days',
  '90': 'Last 90 Days',
  custom: 'Custom Range',
}

function daysToOption(days?: number): DaysOption {
  if (days === 1) return '1'
  if (days === 7) return '7'
  if (days === 30) return '30'
  if (days === 90) return '90'
  return '7'
}

function TimeRangePicker({ value, onChange }: TimeRangePickerProps) {
  const isCustom = !!(value.start_date && value.end_date && !value.days)
  const [mode, setMode] = useState<DaysOption>(
    isCustom ? 'custom' : daysToOption(value.days)
  )
  const [startDate, setStartDate] = useState(value.start_date ?? '')
  const [endDate, setEndDate] = useState(value.end_date ?? '')
  const [showCustom, setShowCustom] = useState(isCustom)

  function handleDaysChange(selected: string) {
    const option = selected as DaysOption
    setMode(option)

    if (option === 'custom') {
      setShowCustom(true)
      return
    }

    setShowCustom(false)
    onChange({ days: Number(option) })
  }

  function handleApplyCustomRange() {
    if (startDate && endDate) {
      onChange({ start_date: startDate, end_date: endDate })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={mode} onValueChange={handleDaysChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(DAYS_LABELS) as DaysOption[]).map((key) => (
            <SelectItem key={key} value={key}>
              {DAYS_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustom && (
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="start-date" className="text-xs">
              Start
            </Label>
            <DatePicker
              id="start-date"
              value={startDate}
              onChange={(v) => setStartDate(v)}
              placeholder="Start date"
              className="w-[160px] h-10"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end-date" className="text-xs">
              End
            </Label>
            <DatePicker
              id="end-date"
              value={endDate}
              onChange={(v) => setEndDate(v)}
              placeholder="End date"
              className="w-[160px] h-10"
            />
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleApplyCustomRange}
            disabled={!startDate || !endDate}
          >
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            Apply
          </Button>
        </div>
      )}
    </div>
  )
}

export { TimeRangePicker }
export type { TimeRangePickerProps }
