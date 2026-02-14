import { AlertTriangle } from 'lucide-react'

interface SLAViolationBannerProps {
  breachingCount: number
}

function SLAViolationBanner({ breachingCount }: SLAViolationBannerProps) {
  if (breachingCount <= 0) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="font-medium">
        {breachingCount} SLA{breachingCount > 1 ? 's' : ''} breaching targets
      </span>
    </div>
  )
}

export { SLAViolationBanner }
