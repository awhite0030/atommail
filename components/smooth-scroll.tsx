'use client'

import { useEffect, useState } from 'react'

/**
 * Momentum smooth scrolling — the foundation of the premium feel.
 * Lenis is imported lazily so it never blocks hydration on first paint;
 * the browser's native scroll stays active until it arrives.
 * Disabled entirely under prefers-reduced-motion.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let destroyed = false

    import('lenis').then(({ default: Lenis }) => {
      if (destroyed) return
      const instance = new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })
      setLenis(instance)

      const loop = (time: number) => {
        instance.raf(time)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    })

    return () => {
      destroyed = true
      cancelAnimationFrame(raf)
      lenis?.destroy()
    }
  }, [lenis])

  return <>{children}</>
}
