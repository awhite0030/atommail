import type { Metadata } from 'next'
import { Navbar, Footer } from '@/components/ui/chrome'
import { Badge } from '@/components/ui/badge'
import { Panel, Label } from '@/components/ui/panel'
import { Reveal } from '@/components/motion/reveal'

export const metadata: Metadata = {
  title: 'About — AtomMail',
  description: 'Why AtomMail exists and how it works under the hood.',
}

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-[840px] px-6 pb-24 pt-20 sm:pt-28">
        <Badge tone="accent" className="mb-7">about</Badge>
        <h1 className="font-display text-h1 font-light text-ink">
          One job, done <span className="italic">cleanly</span>
        </h1>

        <div className="mt-12 grid gap-8">
          {[
            {
              label: 'the idea',
              body: [
                'Most of the internet still demands an email address before it lets you in. AtomMail gives you one that is real enough to receive a message — and gone before anyone can do anything with it. No account, no archive, no trace.',
              ],
            },
            {
              label: 'how it works',
              body: [
                'You press one button. The server creates an address on a real mail domain, driven by a Cloudflare Worker that speaks SMTP.',
                'Incoming mail lands in the inbox screen within seconds — the page polls automatically while the address is alive.',
                'Ten minutes after creation the inbox self-destructs: address and messages are deleted from the database with no backup.',
              ],
            },
            {
              label: 'under the hood',
              body: [
                'Frontend — Next.js 15, React 19, a custom design system with a 3D glass atom built on Three.js.',
                'Mail intake — Cloudflare Worker receiving SMTP and routing into storage.',
                'Storage — Postgres tables that live and die with the inbox TTL: deletes are physical, not soft.',
                'Abuse control — Cloudflare Turnstile on creation, hashed-IP rate limits.',
              ],
            },
          ].map((s, i) => (
            <Reveal key={s.label} delay={Math.min(i * 0.08, 0.3)}>
              <Panel glass className="p-8 sm:p-10">
                <Label className="text-ink">{s.label}</Label>
                <div className="mt-5 grid gap-4">
                  {s.body.map((p, j) => (
                    <p key={j} className="max-w-2xl text-body leading-7 text-ink-mist">
                      {p}
                    </p>
                  ))}
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}
