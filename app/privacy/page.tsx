import type { Metadata } from 'next'
import { Navbar, Footer } from '@/components/ui/chrome'
import { Badge } from '@/components/ui/badge'
import { Panel, Label } from '@/components/ui/panel'

export const metadata: Metadata = {
  title: 'Privacy — AtomMail',
  description: 'What AtomMail stores, what it deletes, and why.',
}

const sections = [
  {
    title: 'What we store',
    body: [
      'A temporary address, its incoming messages, and a one-way hashed IP used only for rate limiting. Nothing else. No accounts, no cookies for tracking, no analytics on your mail.',
    ],
  },
  {
    title: 'How long we keep it',
    body: [
      'Ten minutes. When the address expires, the address and every message inside it are permanently deleted from the database — not hidden, not archived, deleted.',
      'If you close the tab early, the countdown continues on the server anyway. Coming back restores your view only while the address is still alive.',
    ],
  },
  {
    title: 'What we never do',
    body: [
      'Never read or process your mail beyond delivering it to your inbox screen. Never sell, share or transmit your data to third parties. Never keep backups of expired inboxes.',
    ],
  },
  {
    title: 'Abuse protection',
    body: [
      'To keep the service fast and clean, we rate-limit address creation by a salted hash of your IP address. The hash cannot be reversed to your IP, and it is not correlated with your messages.',
      'A Cloudflare Turnstile check protects address creation from bots. It runs entirely on the challenge side — we never see your solving history.',
    ],
  },
  {
    title: 'Your role',
    body: [
      'Temporary mail is exactly that — temporary. Do not use it for anything you cannot afford to lose: account recovery, personal correspondence, or services you want long-term access to.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-[840px] px-6 pb-24 pt-20 sm:pt-28">
        <Badge tone="accent" className="mb-7">privacy</Badge>
        <h1 className="font-display text-h1 font-light text-ink">
          Built to <span className="italic">forget</span>
        </h1>
        <p className="mt-6 max-w-xl text-body leading-7 text-ink-mist">
          The whole service is one privacy policy: minimal data, short life,
          permanent deletion.
        </p>

        <div className="mt-16 grid gap-8">
          {sections.map((s) => (
            <Panel key={s.title} glass className="p-8 sm:p-10">
              <Label className="text-ink">{s.title}</Label>
              <div className="mt-5 grid gap-4">
                {s.body.map((p, i) => (
                  <p key={i} className="max-w-2xl text-body leading-7 text-ink-mist">
                    {p}
                  </p>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}
