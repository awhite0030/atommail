'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

const easeOutSoft = [0.22, 1, 0.36, 1] as const

/**
 * Scroll-triggered reveal: content rises in with a soft blur→sharp focus,
 * the signature of high-end product sites.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: easeOutSoft }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Hero entrance: choreographed on load — badge, headline, lead and chips
 * settle in one after another, echoing the original site's staggered soft-in.
 */
export function HeroIntro({
  children,
  className,
  delay = 0.2,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.14, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  )
}

/** One step of the hero cascade — used inside HeroIntro. */
export function HeroStep({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26, filter: 'blur(7px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.85, ease: easeOutSoft },
        },
      }}
    >
      {children}
    </motion.div>
  )
}
