import { useRef } from 'react'
import { useOutlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { EASING } from '@/lib/animation/constants'
import { useReducedMotion } from '@/lib/animation/use-reduced-motion'

export function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()
  const prefersReducedMotion = useReducedMotion()

  // Capture the outlet so AnimatePresence can render the exiting element
  const outletRef = useRef(outlet)
  if (outlet) {
    outletRef.current = outlet
  }

  if (prefersReducedMotion) {
    return <>{outlet}</>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15, ease: EASING.easeOut }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}
