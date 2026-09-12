'use client'

import { useEffect, useState } from 'react'

export interface TimerProps {
  expiresAt: number
  expired: boolean
  onExpire?: () => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The product's central component: a plain ink countdown that
 * turns danger-red in the final minute. No ornament.
 */
export function Timer({ expiresAt, expired, onExpire }: TimerProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (expired) return
    const tick = () => {
      const t = Date.now()
      setNow(t)
      if (expiresAt - t <= 0) onExpire?.()
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [expiresAt, expired, onExpire])

  const left = Math.max(0, expiresAt - now)
  const m = Math.floor(left / 60000)
  const s = Math.floor((left % 60000) / 1000)
  const urgent = left > 0 && left <= 60_000

  if (expired) {
    return (
      <span className="font-mono text-h2 tabular-nums text-danger" role="timer" aria-live="off">
        Expired
      </span>
    )
  }

  return (
    <span
      role="timer"
      aria-live="off"
      aria-label={`${m} minutes ${s} seconds remaining`}
      className={`font-mono text-h2 tabular-nums tracking-tight ${urgent ? 'text-danger pulse-soft' : 'text-ink'}`}
    >
      {pad(m)}:{pad(s)}
    </span>
  )
}
