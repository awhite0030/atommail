import type { ReactNode } from 'react'

type Tone = 'default' | 'accent' | 'danger' | 'success'

const tones: Record<Tone, string> = {
  default: 'border-strong bg-white/[0.05] text-prism-dust',
  accent: 'border-iris-violet/40 bg-iris-violet/15 text-iris-violet',
  danger: 'border-danger/40 bg-danger/10 text-danger',
  success: 'border-success/40 bg-success/10 text-success',
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
      className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 font-mono text-micro uppercase tracking-label ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
