import { formatDistanceToNow, parseISO } from 'date-fns'

export function formatDate(date: string | Date, tz?: string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: tz || undefined })
}

export function formatDateTime(date: string | Date, tz?: string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: tz || undefined })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

export function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms)}ms`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatChartTick(timestamp: string, days?: number, tz?: string, granularity?: 'hour' | 'day' | 'week' | 'month'): string {
  const date = new Date(timestamp)
  if (granularity === 'hour' || (days && days <= 1)) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: tz || undefined })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: tz || undefined })
}

export function formatChartTooltip(timestamp: string, tz?: string): string {
  return new Date(timestamp).toLocaleString('en-US', { timeZone: tz || undefined })
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
