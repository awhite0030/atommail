'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const loadAtomScene = () => import('./atom-scene')
const AtomScene3D = dynamic(loadAtomScene, { ssr: false })

function prefersReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Phones rarely have the thermal budget for the scene; tablets and up do. */
function isPhoneViewport() {
  if (typeof window === 'undefined') return false
  // Coarse pointer + narrow width = phone
  const coarse = window.matchMedia('(pointer: coarse)').matches
  return coarse && window.innerWidth < 768
}

function isLowPowerDevice() {
  if (typeof navigator === 'undefined') return false
  const cores = navigator.hardwareConcurrency ?? 8
  return cores <= 4
}

/**
 * Loads the 3D atom only when the device can handle it comfortably;
 * otherwise the CSS backdrop alone carries the visuals.
 */
export default function AtomSceneLazy() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion() || isLowPowerDevice() || isPhoneViewport()) return

    // Begin loading the split Three.js chunk immediately after hydration. The
    // old implementation deferred both mounting *and downloading* until idle,
    // making the atom appear several seconds after the rest of the hero.
    void loadAtomScene()

    // Keep the scene out of the critical render path, but bound the wait. A
    // browser that is never idle must not leave the hero half-composed.
    let done = false
    const fire = () => {
      if (done) return
      done = true
      setShow(true)
    }
    const fallback = setTimeout(fire, 250)
    let ricId: number | undefined
    if ('requestIdleCallback' in window) {
      ricId = requestIdleCallback(fire, { timeout: 250 })
    }
    return () => {
      done = true
      clearTimeout(fallback)
      if (ricId !== undefined && 'cancelIdleCallback' in window) {
        cancelIdleCallback(ricId)
      }
    }
  }, [])

  if (!show) return null
  return <AtomScene3D />
}
