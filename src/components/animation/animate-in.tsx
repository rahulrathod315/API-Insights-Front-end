import { motion } from 'framer-motion'
import { VARIANTS, DURATION, EASING } from '@/lib/animation/constants'
import { useReducedMotion } from '@/lib/animation/use-reduced-motion'
import type { ReactNode } from 'react'

type VariantName = keyof typeof VARIANTS

interface AnimateInProps {
  children: ReactNode
  variant?: VariantName
  duration?: number
  delay?: number
  className?: string
}

export function AnimateIn({
  children,
  variant = 'fadeIn',
  duration = DURATION.normal,
  delay = 0,
  className,
}: AnimateInProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  const v = VARIANTS[variant]

  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={{ duration, delay, ease: EASING.easeOut }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
