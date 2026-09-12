'use client'

import type { ReactNode } from 'react'

/**
 * Shared states of the inbox experience. Each state gets a distinct
 * visual treatment inside a Panel, driven only by design tokens.
 */

export function EmptyState({ hint = 'Waiting for mail…' }: { hint?: ReactNode }) {
  return (
    <li className="grid place-items-center gap-4 px-6 py-20 text-center">
      <span
        aria-hidden
        className="pulse-soft grid h-14 w-14 place-items-center rounded-full border border-strong bg-grad-iris-soft"
      >
        <span className="h-2.5 w-2.5 animate-ping rounded-full bg-iris-cyan" />
      </span>
      <p className="max-w-sm text-body text-prism-dust">{hint}</p>
      <span className="font-mono text-micro uppercase tracking-label text-prism-faint">
        auto-refresh · every 3s
      </span>
    </li>
  )
}

export function ExpiredState({ onRenew }: { onRenew: () => void }) {
  return (
    <div className="grid place-items-center gap-4 px-6 py-16 text-center">
      <span
        aria-hidden
        className="grid h-14 w-14 place-items-center rounded-full border border-danger/40 bg-danger/10"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-danger" />
      </span>
      <p className="text-h3 font-display font-light text-prism">This inbox has dissolved.</p>
      <p className="max-w-sm text-body text-prism-dust">
        Addresses and messages are gone for good. Spin up a fresh one whenever you need it.
      </p>
      <button
        onClick={onRenew}
        className="iris-sweep rounded-md bg-grad-iris px-6 py-3 text-body font-semibold text-void shadow-glow transition-fast hover:brightness-110"
      >
        Create new address
      </button>
    </div>
  )
}

export function ErrorState({ message }: { message: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-small text-danger"
    >
      <span aria-hidden className="mt-0.5 font-mono">!</span>
      <div>{message}</div>
    </div>
  )
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <ul aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="pulse-soft grid gap-2 border-b border-strong py-5 last:border-0"
          style={{ animationDelay: `${i * 160}ms` }}
        >
          <div className="h-3 w-1/3 rounded-pill bg-white/[0.07]" />
          <div className="h-3 w-2/3 rounded-pill bg-white/[0.05]" />
        </li>
      ))}
    </ul>
  )
}
