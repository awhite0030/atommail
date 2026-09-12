'use client'

'use client'

import { Label } from '@/components/ui/panel'
import { Modal, ModalHeader } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/states'
import type { Email, EmailFull } from '@/lib/types'

/**
 * Inbox message list + reading modal.
 */
export function EmailList({
  emails,
  loading,
  onOpen,
}: {
  emails: Email[]
  loading: boolean
  onOpen: (id: number) => void
}) {
  return (
    <ul className="border-y border-strong">
      {emails.length === 0 ? (
        <EmptyState hint={loading ? 'Checking for mail…' : 'Waiting for mail. This inbox checks automatically every few seconds.'} />
      ) : (
        emails.map((email) => (
          <li
            key={email.id}
            onClick={() => onOpen(email.id)}
            className="group grid cursor-pointer gap-2 border-b border-strong py-5 transition-fast last:border-0 hover:bg-white/[0.04] sm:grid-cols-[1fr_1.4fr_auto] sm:items-center sm:px-5"
          >
            <span className="truncate text-body font-medium text-prism">{email.sender}</span>
            <span className="truncate text-body text-prism-dust">{email.subject || '(no subject)'}</span>
            <span className="font-mono text-micro uppercase tracking-label text-prism-faint group-hover:text-iris-cyan">
              {new Date(email.received_at).toLocaleTimeString()}
            </span>
          </li>
        ))
      )}
    </ul>
  )
}

export function EmailModal({
  email,
  onClose,
}: {
  email: EmailFull | null
  onClose: () => void
}) {
  return (
    <Modal open={!!email} onClose={onClose}>
      {email && (
        <>
          <ModalHeader
            title={<Label>message detail</Label>}
            onClose={onClose}
          />
          <h2 className="mt-7 font-display text-h2 font-light text-prism">
            {email.subject || '(no subject)'}
          </h2>
          <p className="mt-4 text-small text-prism-dust">
            From {email.sender} · {new Date(email.received_at).toLocaleString()}
          </p>
          <div className="email-body mt-8 border-t border-strong pt-7 text-body leading-7">
            {email.body_html ? (
              <div dangerouslySetInnerHTML={{ __html: email.body_html }} />
            ) : (
              <pre className="whitespace-pre-wrap font-sans">{email.body_text || ''}</pre>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
