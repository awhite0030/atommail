import type { Metadata } from 'next'
import { Navbar, Footer } from '@/components/ui/chrome'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'
import { Reveal } from '@/components/motion/reveal'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ — AtomMail',
  description: 'Frequently asked questions about AtomMail temporary email.',
}

const faqs = [
  {
    q: 'How long does an address live?',
    a: 'Exactly ten minutes from the moment it is created. When the timer hits zero, the address and every message in it are deleted — permanently, not hidden.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. You press one button, get an address, and use it. There is no signup, no email, no password, no profile.',
  },
  {
    q: 'Can I read the messages that arrive?',
    a: 'Yes. The inbox updates automatically every few seconds while the address is alive. Click any message to read it in full.',
  },
  {
    q: 'Can I extend the ten minutes?',
    a: 'Not yet. The expiry is the point — it guarantees that nothing of yours lingers. If you need more time, create a new address.',
  },
  {
    q: 'Is it really private?',
    a: 'We store the minimum needed to run the service: the address, its messages and a hashed IP for rate limiting. Everything is destroyed on expiry, and we run no analytics on your mail.',
  },
  {
    q: 'Who should use this?',
    a: 'Perfect for one-off signups, downloads, trials and verifications where you do not want to hand over your real address. It is not meant for anything important or long-term.',
  },
  {
    q: 'Can I send mail from an AtomMail address?',
    a: 'No — it is receive-only. A mailbox that can only receive is simpler, safer, and harder to abuse.',
  },
  {
    q: 'What happens if I close the tab?',
    a: 'The address keeps receiving mail until it expires. When you come back to the site, your session is restored automatically (until the ten minutes are up).',
  },
]

export default function FaqPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-[840px] px-6 pb-24 pt-20 sm:pt-28">
        <Badge tone="accent" className="mb-7">questions</Badge>
        <h1 className="font-display text-h1 font-light text-ink">
          Frequently asked <span className="italic">questions</span>
        </h1>
        <p className="mt-6 max-w-xl text-body leading-7 text-ink-mist">
          Everything about how the ten-minute inbox works.
        </p>

        <div className="mt-16 grid gap-0">
          {faqs.map((f, i) => (
            <Reveal key={i} delay={Math.min(i * 0.05, 0.3)} y={16}>
              <details
                className="group border-t border-strong py-6 last:border-b open:bg-ink/[0.02]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-body font-medium text-ink transition-fast [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="font-mono text-micro uppercase tracking-label text-ink-mist transition-fast group-open:rotate-45">
                    +
                  </span>
              </summary>
              <p className="mt-4 max-w-2xl text-body leading-7 text-ink-mist">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-5">
          <Link href="/">
            <Button size="lg">Get a temporary address</Button>
          </Link>
          <Label className="text-ink-mist">no signup · 10 minutes · zero traces</Label>
        </div>
      </section>
      <Footer />
    </main>
  )
}
