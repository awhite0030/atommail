import type { ReactNode } from 'react'

type Tone = 'default' | 'accent' | 'danger' | 'success'

const tones: Record<Tone, string> = {
  default: 'border-ink/15 bg-white text-ink-mist',
  accent: 'border-ink/25 bg-white text-ink',
  danger: 'border-danger/40 bg-white text-danger',
  success: 'border-success/40 bg-white text-success',
}

export function Badge({
  tone = 'default',
  children,
  className = '',
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border px-4 py-1.5 font-mono text-micro uppercase tracking-label ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
