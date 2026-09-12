'use client'

import type { ReactNode } from 'react'

/** Full-screen modal with paper overlay; closes on backdrop click or Escape. */
export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-modal grid place-items-center bg-ink/25 p-4 backdrop-blur-[6px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="panel-glass rise-in max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-lg p-6 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, onClose }: { title: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5">
      {title}
      <button
        onClick={onClose}
        aria-label="Close"
        className="rounded-pill border border-ink/20 px-4 py-1.5 font-mono text-micro uppercase tracking-label text-ink-mist transition-fast hover:border-ink hover:text-ink"
      >
        esc
      </button>
    </div>
  )
}
