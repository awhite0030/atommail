'use client'

import { Navbar, Footer } from '@/components/ui/chrome'
import { Button } from '@/components/ui/button'
import { Panel, Label } from '@/components/ui/panel'
import { Badge } from '@/components/ui/badge'
import { Timer } from '@/components/ui/timer'
import { EmptyState, ExpiredState, ErrorState, SkeletonRows } from '@/components/ui/states'
import { EmailList } from '@/components/email-list'

const surfaces: [string, string][] = [
  ['void', 'var(--c-void)'],
  ['abyss', 'var(--c-abyss)'],
  ['deep', 'var(--c-deep)'],
  ['crust', 'var(--c-crust)'],
  ['surface', 'var(--c-surface)'],
  ['raised', 'var(--c-raised)'],
]

const organic: [string, string][] = [
  ['iris-violet', 'var(--c-iris-violet)'],
  ['iris-indigo', 'var(--c-iris-indigo)'],
  ['iris-cyan', 'var(--c-iris-cyan)'],
  ['iris-teal', 'var(--c-iris-teal)'],
  ['iris-pink', 'var(--c-iris-pink)'],
  ['iris-amber', 'var(--c-iris-amber)'],
]

const inks: [string, string][] = [
  ['ink', 'var(--c-ink)'],
  ['mist', 'var(--c-mist)'],
  ['dust', 'var(--c-dust)'],
  ['faint', 'var(--c-faint)'],
]

function SwatchRow({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map(([name, value]) => (
        <div key={name} className="grid gap-2">
          <div
            className="h-16 rounded-md border border-ink/10"
            style={{ background: value }}
          />
          <span className="font-mono text-micro uppercase tracking-label text-ink-mist">
            {name}
          </span>
        </div>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink/10 pt-10">
      <Label className="text-ink">{title}</Label>
      <div className="mt-8">{children}</div>
    </section>
  )
}

export default function DesignPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-[1200px] space-y-16 px-6 pb-24 pt-20 sm:pt-28">
        <header>
          <Badge tone="accent" className="mb-7">design system · v1.1</Badge>
          <h1 className="font-display text-h1 font-light text-ink">
            Paper & <span className="italic">Ink</span>
          </h1>
          <p className="mt-6 max-w-xl text-body leading-7 text-ink-mist">
            Living styleguide — editorial light theme. The same tokens and
            components the product is built from.
          </p>
        </header>

        <Section title="colors · surfaces">
          <SwatchRow items={surfaces} />
        </Section>

        <Section title="colors · organic tones">
          <SwatchRow items={organic} />
        </Section>

        <Section title="colors · ink ramp">
          <SwatchRow items={inks} />
        </Section>

        <Section title="typography">
          <div className="grid gap-8">
            <div className="grid gap-2">
              <Label>display · fraunces</Label>
              <p className="font-display text-hero font-light text-ink">Aa Email</p>
            </div>
            <div className="grid gap-2">
              <Label>body · inter</Label>
              <p className="text-h3 text-ink">Aa — The quick brown fox</p>
            </div>
            <div className="grid gap-2">
              <Label>mono · ibm plex mono</Label>
              <p className="font-mono text-body text-ink-mist">Aa 10:00 · x7kf@mail</p>
            </div>
          </div>
        </Section>

        <Section title="buttons">
          <div className="flex flex-wrap items-center gap-5">
            <Button size="lg">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="badges">
          <div className="flex flex-wrap items-center gap-4">
            <Badge>default</Badge>
            <Badge tone="accent">accent</Badge>
            <Badge tone="danger">danger</Badge>
            <Badge tone="success">success</Badge>
          </div>
        </Section>

        <Section title="timer">
          <Panel glass className="inline-flex items-center gap-8 p-8">
            <Timer expiresAt={Date.now() + 600_000} expired={false} />
            <Timer expiresAt={0} expired />
          </Panel>
        </Section>

        <Section title="states">
          <div className="grid gap-8 lg:grid-cols-2">
            <Panel glass>
              <ul className="border-y border-ink/10">
                <EmptyState />
              </ul>
            </Panel>
            <Panel glass>
              <ExpiredState onRenew={() => {}} />
            </Panel>
            <Panel glass className="p-6">
              <ErrorState message="Network error. Please try again." />
              <div className="mt-6">
                <SkeletonRows />
              </div>
            </Panel>
            <Panel glass className="p-6">
              <EmailList
                emails={[
                  { id: 1, sender: 'GitHub', subject: 'Verify your device', received_at: Date.now() - 42_000 },
                  { id: 2, sender: 'Figma', subject: 'Sign-in code: 8841', received_at: Date.now() - 120_000 },
                ]}
                loading={false}
                onOpen={() => {}}
              />
            </Panel>
          </div>
        </Section>
      </section>
      <Footer />
    </main>
  )
}
