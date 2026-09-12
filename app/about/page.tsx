import type { Metadata } from 'next'
import { Navbar, Footer } from '@/components/ui/chrome'
import { Badge } from '@/components/ui/badge'
import { Panel, Label } from '@/components/ui/panel'

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
        <h1 className="font-display text-h1 font-light text-prism">
          One job, done <span className="text-iris italic">cleanly</span>
        </h1>

        <div className="mt-12 grid gap-8">
          <Panel glass className="p-8 sm:p-10">
            <Label className="text-iris-cyan">the idea</Label>
            <p className="mt-5 max-w-2xl text-body leading-7 text-prism-mist">
              Most of the internet still demands an email address before it lets
              you in. AtomMail gives you one that is real enough to receive a
              message — and gone before anyone can do anything with it. No
              account, no archive, no trace.
            </p>
          </Panel>

          <Panel glass className="p-8 sm:p-10">
            <Label className="text-iris-cyan">how it works</Label>
            <div className="mt-5 grid gap-4 text-body leading-7 text-prism-mist">
              <p>
                You press one button. The server creates an address on a real
                mail domain, driven by a Cloudflare Worker that speaks SMTP.
              </p>
              <p>
                Incoming mail lands in the inbox screen within seconds — the
                page polls automatically while the address is alive.
              </p>
              <p>
                Ten minutes after creation the inbox self-destructs: address and
                messages are deleted from the database with no backup.
              </p>
            </div>
          </Panel>

          <Panel glass className="p-8 sm:p-10">
            <Label className="text-iris-cyan">under the hood</Label>
            <div className="mt-5 grid gap-4">
              {[
                ['Frontend', 'Next.js 15, React 19, a custom design system with a 3D prismatic atom built on Three.js.'],
                ['Mail intake', 'Cloudflare Worker receiving SMTP and routing into storage.'],
                ['Storage', 'Postgres tables that live and die with the inbox TTL — deletes are physical, not soft.'],
                ['Abuse control', 'Cloudflare Turnstile on creation, hashed-IP rate limits.'],
              ].map(([k, v]) => (
                <div key={k} className="grid gap-1">
                  <span className="font-mono text-micro uppercase tracking-label text-iris-violet">{k}</span>
                  <p className="max-w-2xl text-body leading-7 text-prism-mist">{v}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
      <Footer />
    </main>
  )
}
