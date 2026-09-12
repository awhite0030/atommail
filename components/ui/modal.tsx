import type { ReactNode } from 'react'

/** Full-screen modal with glass overlay; closes on backdrop click or Escape. */
export function Modal({
  open,
  onClose,
  title,
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
      className="fixed inset-0 z-modal grid place-items-center bg-void/85 p-4 backdrop-blur-md"
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
    <div className="flex items-start justify-between gap-4 border-b border-strong pb-5">
      {title}
      <button
        onClick={onClose}
        aria-label="Close"
        className="rounded-sm border border-strong px-3 py-2 font-mono text-micro uppercase tracking-label text-prism-dust transition-fast hover:bg-white/[0.08] hover:text-prism"
      >
        esc
      </button>
    </div>
  )
}
