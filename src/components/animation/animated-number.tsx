import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/animation/use-reduced-motion'

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatter?: (value: number) => string
  className?: string
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export function AnimatedNumber({
  value,
  duration = 600,
  formatter = (v) => String(v),
  className,
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value)
      previousValue.current = value
      return
    }

    const from = previousValue.current
    const to = value
    previousValue.current = value

    if (from === to) return

    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)
      const current = from + (to - from) * easedProgress

      setDisplayValue(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [value, duration, prefersReducedMotion])

  return <span className={className}>{formatter(displayValue)}</span>
}
