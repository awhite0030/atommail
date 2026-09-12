'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'

const easeOutSoft = [0.22, 1, 0.36, 1] as const

/**
 * Site opening: an ink curtain with the wordmark lifts away and the page
 * settles underneath. Short by design (~1.4s), skipped entirely under
 * prefers-reduced-motion, and only the first visit per browser session.
 */

/** True while the intro curtain is showing (for coordinating hero delays). */
export function useSiteIntroPlaying() {
  const [playing, setPlaying] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const seen = sessionStorage.getItem('atommail_intro_played')
    if (seen) return
    setPlaying(true)
    const t = setTimeout(() => setPlaying(false), 1900)
    return () => clearTimeout(t)
  }, [reduced])

  return playing
}

export function SiteIntro() {
  const reduced = useReducedMotion()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // SSR/hydration safety: decide only on the client
    const seen = sessionStorage.getItem('atommail_intro_played')
    if (seen || reduced) return
    setShow(true)
    sessionStorage.setItem('atommail_intro_played', '1')
    const t = setTimeout(() => setShow(false), 1900)
    return () => clearTimeout(t)
  }, [reduced])

  if (reduced) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] grid place-items-center bg-ink"
          initial={{ y: 0 }}
          exit={{ y: '-100%', transition: { duration: 0.85, ease: easeOutSoft } }}
          aria-hidden
        >
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: easeOutSoft }}
          >
            {/* Minimal atom mark: core dot + two orbit strokes */}
            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
              <circle cx="17" cy="17" r="3.2" fill="#f1f1f1" />
              <motion.ellipse
                cx="17"
                cy="17"
                rx="14"
                ry="5.5"
                stroke="#f1f1f1"
                strokeOpacity="0.5"
                strokeWidth="1.1"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
                style={{ originX: '17px', originY: '17px' }}
              />
              <motion.ellipse
                cx="17"
                cy="17"
                rx="14"
                ry="5.5"
                stroke="#f1f1f1"
                strokeOpacity="0.3"
                strokeWidth="1.1"
                initial={{ rotate: 90 }}
                animate={{ rotate: 450 }}
                transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
                style={{ originX: '17px', originY: '17px' }}
              />
            </svg>
            <motion.span
              className="font-display text-xl tracking-tight text-[#f1f1f1]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: easeOutSoft }}
            >
              atommail
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
