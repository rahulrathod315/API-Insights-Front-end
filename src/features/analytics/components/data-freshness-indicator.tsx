import { useEffect, useState } from 'react'
import { RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface DataFreshnessIndicatorProps {
  isFetching?: boolean
  dataUpdatedAt?: number
  onRefresh?: () => void
  className?: string
  refetchInterval?: number // in milliseconds
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function DataFreshnessIndicator({
  isFetching = false,
  dataUpdatedAt,
  onRefresh,
  className,
  refetchInterval = 30_000,
}: DataFreshnessIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState('')
  const [progress, setProgress] = useState(0)

  // Update time ago display
  useEffect(() => {
    if (!dataUpdatedAt) return

    const updateTimeAgo = () => {
      setTimeAgo(formatTimeAgo(dataUpdatedAt))
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(interval)
  }, [dataUpdatedAt])

  // Update progress bar for auto-refresh countdown
  useEffect(() => {
    if (!dataUpdatedAt || isFetching) {
      setProgress(0)
      return
    }

    const updateProgress = () => {
      const elapsed = Date.now() - dataUpdatedAt
      const percentage = Math.min((elapsed / refetchInterval) * 100, 100)
      setProgress(percentage)
    }

    updateProgress()
    const interval = setInterval(updateProgress, 100)
    return () => clearInterval(interval)
  }, [dataUpdatedAt, refetchInterval, isFetching])

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Last Updated */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>{dataUpdatedAt ? timeAgo : 'Loading...'}</span>
      </div>

      {/* Auto-refresh Progress */}
      {dataUpdatedAt && !isFetching && (
        <div className="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/60 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isFetching}
          className="h-7 gap-1.5 px-2 text-xs"
        >
          <RefreshCw
            className={cn(
              'h-3.5 w-3.5',
              isFetching && 'animate-spin'
            )}
          />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      )}

      {/* Fetching Indicator */}
      {isFetching && (
        <div className="flex items-center gap-1.5 text-xs text-primary">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          <span>Updating...</span>
        </div>
      )}
    </div>
  )
}
