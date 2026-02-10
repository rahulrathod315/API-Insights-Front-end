import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
}

function TableSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* Header row */}
      <div className="flex gap-4 border-b pb-3">
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[25%]" />
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[15%]" />
        <Skeleton className="h-4 w-[10%]" />
      </div>
      {/* Data rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-4 w-[25%]" />
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-4 w-[15%]" />
          <Skeleton className="h-4 w-[10%]" />
        </div>
      ))}
    </div>
  )
}

function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-[40%]" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-8 w-[60%]" />
      <Skeleton className="mt-2 h-3 w-[30%]" />
    </div>
  )
}

function ChartSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 shadow-sm',
        className
      )}
    >
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-[30%]" />
        <Skeleton className="h-3 w-[50%]" />
      </div>
      <div className="flex items-end gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{
              height: `${Math.max(20, Math.random() * 100)}%`,
              minHeight: '20px',
              maxHeight: '160px',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function FormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  )
}

export { TableSkeleton, CardSkeleton, ChartSkeleton, FormSkeleton }
