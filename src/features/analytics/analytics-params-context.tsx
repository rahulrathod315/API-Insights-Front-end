import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { AnalyticsParams } from './types'

interface AnalyticsParamsContextValue {
  params: AnalyticsParams
  setParams: (params: AnalyticsParams) => void
}

const AnalyticsParamsContext = createContext<AnalyticsParamsContextValue | null>(null)

export function AnalyticsParamsProvider({ children }: { children: ReactNode }) {
  const [params, setParamsState] = useState<AnalyticsParams>({ days: 7, granularity: 'day' })

  const setParams = useCallback((next: AnalyticsParams) => {
    const resolved = { ...next }
    // Auto-set recommended granularity if not explicitly provided
    if (!resolved.granularity && resolved.days) {
      if (resolved.days <= 2) {
        resolved.granularity = 'hour'
      } else if (resolved.days <= 90) {
        resolved.granularity = 'day'
      } else if (resolved.days <= 180) {
        resolved.granularity = 'week'
      } else {
        resolved.granularity = 'month'
      }
    }
    setParamsState(resolved)
  }, [])

  return (
    <AnalyticsParamsContext.Provider value={{ params, setParams }}>
      {children}
    </AnalyticsParamsContext.Provider>
  )
}

export function useAnalyticsParams(): AnalyticsParamsContextValue {
  const ctx = useContext(AnalyticsParamsContext)
  if (!ctx) {
    throw new Error('useAnalyticsParams must be used within AnalyticsParamsProvider')
  }
  return ctx
}
