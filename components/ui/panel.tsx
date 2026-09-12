import type { HTMLAttributes, ReactNode } from 'react'

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** Adds the frosted-glass treatment */
  glass?: boolean
}

export function Panel({ glass = true, className = '', children, ...props }: PanelProps) {
  return (
    <div
      className={`rounded-lg border border-strong ${glass ? 'panel-glass' : 'bg-panel-solid shadow-raised'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

/** Mono uppercase micro-label, the system's signature metadata style */
export function Label({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-micro uppercase text-prism-dust tracking-label ${className}`}>
      {children}
    </span>
  )
}
