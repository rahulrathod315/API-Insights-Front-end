import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import type { AuditLogFilters } from '../types'

const ACTION_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'invite', label: 'Invite' },
  { value: 'remove', label: 'Remove' },
  { value: 'enable', label: 'Enable' },
  { value: 'disable', label: 'Disable' },
] as const

const RESOURCE_TYPE_OPTIONS = [
  { value: 'project', label: 'Project' },
  { value: 'endpoint', label: 'Endpoint' },
  { value: 'alert', label: 'Alert' },
  { value: 'member', label: 'Member' },
  { value: 'api_key', label: 'API Key' },
  { value: 'webhook', label: 'Webhook' },
] as const

interface AuditLogFiltersProps {
  filters: AuditLogFilters
  onFiltersChange: (filters: AuditLogFilters) => void
}

function AuditLogFiltersBar({ filters, onFiltersChange }: AuditLogFiltersProps) {
  const hasActiveFilters =
    filters.action ||
    filters.resource_type ||
    filters.date_from ||
    filters.date_to

  function handleActionChange(value: string) {
    onFiltersChange({
      ...filters,
      action: value === 'all' ? undefined : value,
      page: 1,
    })
  }

  function handleResourceTypeChange(value: string) {
    onFiltersChange({
      ...filters,
      resource_type: value === 'all' ? undefined : value,
      page: 1,
    })
  }

  function handleDateFromChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFiltersChange({
      ...filters,
      date_from: e.target.value || undefined,
      page: 1,
    })
  }

  function handleDateToChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFiltersChange({
      ...filters,
      date_to: e.target.value || undefined,
      page: 1,
    })
  }

  function handleClearFilters() {
    onFiltersChange({
      page: 1,
      page_size: filters.page_size,
    })
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-card p-4">
      <div className="space-y-1.5">
        <Label htmlFor="action-filter">Action</Label>
        <Select
          value={filters.action ?? 'all'}
          onValueChange={handleActionChange}
        >
          <SelectTrigger id="action-filter" className="w-[160px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {ACTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resource-type-filter">Resource type</Label>
        <Select
          value={filters.resource_type ?? 'all'}
          onValueChange={handleResourceTypeChange}
        >
          <SelectTrigger id="resource-type-filter" className="w-[160px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {RESOURCE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date-from-filter">From date</Label>
        <Input
          id="date-from-filter"
          type="date"
          className="w-[160px]"
          value={filters.date_from ?? ''}
          onChange={handleDateFromChange}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date-to-filter">To date</Label>
        <Input
          id="date-to-filter"
          type="date"
          className="w-[160px]"
          value={filters.date_to ?? ''}
          onChange={handleDateToChange}
        />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="mb-0.5"
        >
          <X className="mr-1 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  )
}

export { AuditLogFiltersBar }
export type { AuditLogFiltersProps }
