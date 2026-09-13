'use client'

import type { ReactNode } from 'react'

/**
 * Shared states of the inbox experience — quiet, typographic,
 * the reference's "lots of air" principle.
 */

export function EmptyState({ hint = 'Waiting for mail…' }: { hint?: ReactNode }) {
  return (
    <li className="grid place-items-center gap-4 px-6 py-20 text-center">
      <span
        aria-hidden
        className="pulse-soft grid h-12 w-12 place-items-center rounded-pill border border-ink/15"
      >
        <span className="h-1.5 w-1.5 rounded-pill bg-ink-mist" />
      </span>
      <p className="max-w-sm text-body text-ink-mist">{hint}</p>
      <span className="font-mono text-micro uppercase tracking-label text-ink-faint">
        auto-refresh · every 3s
      </span>
    </li>
  )
}

export function ExpiredState({ onRenew }: { onRenew: () => void }) {
  return (
    <div className="grid place-items-center gap-4 px-6 py-16 text-center">
      <p className="font-display text-h2 font-light italic text-ink">
        This inbox has dissolved.
      </p>
      <p className="max-w-sm text-body text-ink-mist">
        Addresses and messages are gone for good. Spin up a fresh one whenever you need it.
      </p>
      <button
        onClick={onRenew}
        className="btn-flat mt-2 rounded-pill bg-ink px-14 py-4 font-sans text-small font-medium uppercase tracking-[0.08em] text-white"
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
      className="flex items-start gap-3 rounded-md border border-danger/40 bg-white px-4 py-3 text-small text-danger"
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
          className="pulse-soft grid gap-2 border-b border-ink/10 py-5 last:border-0"
          style={{ animationDelay: `${i * 160}ms` }}
        >
          <div className="h-3 w-1/3 rounded-pill bg-ink/10" />
          <div className="h-3 w-2/3 rounded-pill bg-ink/5" />
        </li>
      ))}
    </ul>
  )
}
