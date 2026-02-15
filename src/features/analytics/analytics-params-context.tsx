import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { AnalyticsParams } from './types'

interface AnalyticsParamsContextValue {
  params: AnalyticsParams
  setParams: (params: AnalyticsParams) => void
}

const AnalyticsParamsContext = createContext<AnalyticsParamsContextValue | null>(null)

export function AnalyticsParamsProvider({ children }: { children: ReactNode }) {
  const [params, setParamsState] = useState<AnalyticsParams>({ days: 7 })

  const setParams = useCallback((next: AnalyticsParams) => {
    setParamsState(next)
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
