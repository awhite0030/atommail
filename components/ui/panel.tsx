import type { HTMLAttributes, ReactNode } from 'react'

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** White elevated surface with the single soft drop */
  glass?: boolean
}

export function Panel({ glass = true, className = '', children, ...props }: PanelProps) {
  return (
    <div
      className={`rounded-md border border-ink/10 ${glass ? 'panel-glass' : 'bg-panel-solid shadow-raised'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/** Mono uppercase micro-label, the system's signature metadata style */
export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-micro uppercase text-ink-dust tracking-label ${className}`}>
      {children}
    </span>
  )
}
