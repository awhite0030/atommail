'use client'

import { useEffect, useState } from 'react'

let toastId = 0
const listeners = new Set<(t: Toast) => void>()

export interface Toast {
  id: number
  message: string
  tone?: 'default' | 'success' | 'danger'
}

export function toast(message: string, tone: Toast['tone'] = 'default') {
  const t = { id: ++toastId, message, tone }
  listeners.forEach((l) => l(t))
}

export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const on = (t: Toast) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 2600)
    }
    listeners.add(on)
    return () => {
      listeners.delete(on)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-toast flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`rise-in panel-glass rounded-pill border px-5 py-2.5 font-mono text-micro uppercase tracking-label ${
            t.tone === 'danger'
              ? 'border-danger/50 text-danger'
              : t.tone === 'success'
                ? 'border-success/50 text-success'
                : 'border-strong text-prism-mist'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
