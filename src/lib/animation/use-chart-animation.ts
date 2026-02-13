import { useReducedMotion } from './use-reduced-motion'

type AnimationTiming = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear'

interface ChartAnimationProps {
  isAnimationActive: boolean
  animationDuration: number
  animationEasing: AnimationTiming
}

export function useChartAnimation(duration = 400): ChartAnimationProps {
  const prefersReducedMotion = useReducedMotion()

  return {
    isAnimationActive: !prefersReducedMotion,
    animationDuration: prefersReducedMotion ? 0 : duration,
    animationEasing: 'ease-out' as const,
  }
}
