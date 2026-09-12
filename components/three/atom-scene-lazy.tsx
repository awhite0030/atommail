'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const AtomScene3D = dynamic(() => import('./atom-scene'), { ssr: false })

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
    // Defer until the browser is idle so LCP is not blocked
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window ? requestIdleCallback(cb) : setTimeout(cb, 400)
    const id = idle(() => setShow(true))
    return () => {
      if ('cancelIdleCallback' in window) cancelIdleCallback(id as number)
    }
  }, [])

  if (!show) return null
  return <AtomScene3D />
}
