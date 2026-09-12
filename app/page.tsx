'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navbar, Footer } from '@/components/ui/chrome'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'
import { ExpiredState } from '@/components/ui/states'
import { ToastViewport, toast } from '@/components/ui/toast'
import { InboxPanel } from '@/components/inbox-panel'
import { EmailList, EmailModal } from '@/components/email-list'
import AtomSceneLazy from '@/components/three/atom-scene-lazy'
import type { Email, EmailFull } from '@/lib/types'

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: any) => string
      reset: (widgetId?: string) => void
      getResponse: (widgetId?: string) => string
    }
  }
}

export default function Home() {
  const [address, setAddress] = useState('')
  const [expiresAt, setExpiresAt] = useState(0)
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailFull | null>(null)
  const [loading, setLoading] = useState(false)
  const [expired, setExpired] = useState(false)
  const [error, setError] = useState('')

  // Восстановление адреса из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('atommail_session')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.expiresAt > Date.now()) {
          setAddress(data.address)
          setExpiresAt(data.expiresAt)
        } else {
          localStorage.removeItem('atommail_session')
        }
      } catch (err) {
        console.error('Failed to restore session:', err)
        localStorage.removeItem('atommail_session')
      }
    }
  }, [])

  // Load Turnstile script on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const saveSession = (addr: string, exp: number) => {
    localStorage.setItem('atommail_session', JSON.stringify({ address: addr, expiresAt: exp }))
  }

  const clearSession = () => {
    localStorage.removeItem('atommail_session')
  }

  const createInbox = async () => {
    setLoading(true)
    setError('')
    try {
      const turnstileToken = window.turnstile?.getResponse() ?? ''
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnstileToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create inbox')
        return
      }
      setAddress(data.address)
      setExpiresAt(data.expiresAt)
      setExpired(false)
      setEmails([])
      saveSession(data.address, data.expiresAt)
      toast('Inbox ready', 'success')
    } catch (err) {
      console.error('Failed to create inbox:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmails = useCallback(async () => {
    if (!address) return
    try {
      const res = await fetch(`/api/inbox/${encodeURIComponent(address)}/emails`)
      if (!res.ok) {
        console.warn('fetchEmails: status', res.status)
        return
      }
      const data = await res.json()
      if (data.expired) {
        setExpired(true)
        clearSession()
        return
      }
      setEmails(data.emails || [])
    } catch (err) {
      console.error('Failed to fetch emails:', err)
    }
  }, [address])

  const viewEmail = async (id: number) => {
    try {
      const res = await fetch(`/api/email/${id}`)
      const data = await res.json()
      setSelectedEmail(data)
    } catch (err) {
      console.error('Failed to load email:', err)
    }
  }

  const refreshInbox = () => {
    fetchEmails()
  }

  useEffect(() => {
    if (!address || expired) return
    const poll = setInterval(fetchEmails, 3000)
    return () => clearInterval(poll)
  }, [address, expired, fetchEmails])

  const sanitize = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    div.querySelectorAll('script,iframe,object,embed,form').forEach((n) => n.remove())
    div.querySelectorAll('*').forEach((el) => {
      ;[...el.attributes].forEach((a) => {
        if (a.name.startsWith('on')) el.removeAttribute(a.name)
      })
    })
    return div.innerHTML
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AtomSceneLazy />
      {/* CSS gradient backdrop — always present, 3D layers on top */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(93, 109, 158, 0.16) 0%, transparent 60%), radial-gradient(ellipse 60% 45% at 85% 20%, rgba(95, 143, 163, 0.10) 0%, transparent 65%), radial-gradient(ellipse 55% 40% at 12% 30%, rgba(168, 120, 136, 0.08) 0%, transparent 60%), var(--c-void)',
        }}
      />

      <Navbar />
      <ToastViewport />

      <section className="mx-auto max-w-[1200px] px-6 pb-20 pt-20 sm:pb-28 sm:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rise-in max-w-3xl">
            <Badge tone="accent" className="mb-7">
              private delivery station
            </Badge>
            <h1 className="font-display text-hero font-light text-prism">
              Email for the <span className="text-iris italic">moment</span>
            </h1>
            <p className="mt-8 max-w-xl text-body font-light leading-7 text-prism-mist sm:text-lg">
              Make a private address in seconds. Receive what you need, then leave
              nothing behind.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Badge>no signup</Badge>
              <Badge>no archive</Badge>
              <Badge>expires in 10 min</Badge>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <InboxPanel
              address={address}
              expiresAt={expiresAt}
              expired={expired}
              loading={loading}
              error={error}
              onCreate={createInbox}
            />
          </div>
        </div>
      </section>

      {address && !expired && (
        <section className="border-t border-strong px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <Label className="text-iris-cyan">inbox / {emails.length} messages</Label>
                <h2 className="mt-3 font-display text-h2 font-light text-prism">
                  Incoming <span className="italic text-iris-violet">mail</span>
                </h2>
              </div>
              <Button variant="secondary" size="sm" onClick={refreshInbox}>
                Refresh
              </Button>
            </div>
            <EmailList emails={emails} loading={false} onOpen={viewEmail} />
          </div>
        </section>
      )}

      {address && expired && (
        <section className="border-t border-strong px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-[1200px]">
            <ExpiredState
              onRenew={() => {
                setExpired(false)
                setAddress('')
                setEmails([])
              }}
            />
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-[1200px] gap-12 px-6 py-20 sm:grid-cols-3 sm:py-28">
        {[
          ['01', 'No account', 'Start with an address, not a profile.'],
          ['02', 'No archive', 'Messages vanish with the inbox.'],
          ['03', 'No clutter', 'One purpose. One temporary place.'],
        ].map(([number, title, description]) => (
          <article key={number} className="rise-in border-t border-strong pt-6">
            <span className="font-mono text-micro tracking-label text-iris-violet">{number}</span>
            <h3 className="mt-6 font-display text-h3 font-light text-prism">{title}</h3>
            <p className="mt-3 max-w-xs text-body leading-6 text-prism-dust">{description}</p>
          </article>
        ))}
      </section>

      <Footer />

      {selectedEmail && (
        <EmailModal
          email={{ ...selectedEmail, body_html: sanitize(selectedEmail.body_html) }}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </main>
  )
}
