import { useState } from 'react'
import { Download, Loader2, FileSpreadsheet, FileJson, Database } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils/cn'
import { format, subDays, differenceInDays } from 'date-fns'
import { formatNumber } from '@/lib/utils/format'

type ExportFormat = 'csv' | 'json'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (params: { format: ExportFormat; start_date: string; end_date: string; limit?: number }) => Promise<void>
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; description: string; icon: typeof FileSpreadsheet }[] = [
  { value: 'csv', label: 'CSV', description: 'For spreadsheets (Excel, Google Sheets)', icon: FileSpreadsheet },
  { value: 'json', label: 'JSON', description: 'For integrations and APIs', icon: FileJson },
]

const LIMIT_OPTIONS = [
  { value: '1000', label: '1,000 records' },
  { value: '5000', label: '5,000 records' },
  { value: '10000', label: '10,000 records' },
  { value: '25000', label: '25,000 records' },
  { value: '50000', label: '50,000 records (max)' },
]

function ExportDialog({ open, onOpenChange, onExport }: ExportDialogProps) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd')

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv')
  const [startDate, setStartDate] = useState(thirtyDaysAgo)
  const [endDate, setEndDate] = useState(today)
  const [limit, setLimit] = useState('10000')
  const [isExporting, setIsExporting] = useState(false)

  const dateRangeDays = startDate && endDate
    ? differenceInDays(new Date(endDate), new Date(startDate)) + 1
    : 0

  async function handleExport() {
    setIsExporting(true)
    try {
      await onExport({
        format: selectedFormat,
        start_date: startDate,
        end_date: endDate,
        limit: parseInt(limit, 10),
      })
      onOpenChange(false)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Analytics Data
          </DialogTitle>
          <DialogDescription>
            Download raw request data for the selected period. Up to 50,000 records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Date Range</Label>
              {dateRangeDays > 0 && (
                <span className="text-xs text-muted-foreground">
                  {dateRangeDays} {dateRangeDays === 1 ? 'day' : 'days'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="export-start" className="text-xs text-muted-foreground">
                  Start Date
                </Label>
                <DatePicker
                  id="export-start"
                  value={startDate}
                  onChange={(v) => setStartDate(v)}
                  placeholder="Start date"
                  className="w-full h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="export-end" className="text-xs text-muted-foreground">
                  End Date
                </Label>
                <DatePicker
                  id="export-end"
                  value={endDate}
                  onChange={(v) => setEndDate(v)}
                  placeholder="End date"
                  className="w-full h-10"
                />
              </div>
            </div>
          </div>

          {/* Record Limit */}
          <div className="space-y-3">
            <Label htmlFor="export-limit" className="text-sm font-medium">
              Maximum Records
            </Label>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <Select value={limit} onValueChange={setLimit}>
                <SelectTrigger id="export-limit" className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIMIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Exports the most recent {formatNumber(parseInt(limit, 10))} requests within the date range
            </p>
          </div>

          {/* Format Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Format</Label>
            <div className="grid grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map((opt) => {
                const Icon = opt.icon
                const isSelected = selectedFormat === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedFormat(opt.value)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    )}
                  >
                    <Icon className={cn('h-6 w-6', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', isSelected && 'text-primary')}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !startDate || !endDate}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ExportDialog }
export type { ExportDialogProps }
