'use client'

import Link from 'next/link'
import { useState } from 'react'

export function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/faq', label: 'FAQ' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="sticky top-0 z-nav border-b border-ink/10 bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="font-display text-xl font-normal tracking-tight text-ink">
          atommail
        </Link>

        <div className="hidden items-center gap-10 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-small uppercase tracking-[0.08em] text-ink-mist transition-fast hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          className="sm:hidden font-mono text-micro uppercase tracking-label text-ink-mist"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu"
        >
          {open ? 'close' : 'menu'}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-void px-6 py-4 sm:hidden">
          <div className="grid gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-sans text-small uppercase tracking-[0.08em] text-ink-mist"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-ink/10 px-6 py-8">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-display text-base text-ink">
          atommail
        </Link>
        <div className="flex flex-wrap items-center gap-8">
          <Link href="/faq" className="text-small text-ink-mist transition-fast hover:text-ink">FAQ</Link>
          <Link href="/privacy" className="text-small text-ink-mist transition-fast hover:text-ink">Privacy</Link>
          <Link href="/about" className="text-small text-ink-mist transition-fast hover:text-ink">About</Link>
          <a href="/design" className="text-small text-ink-faint transition-fast hover:text-ink">Design</a>
        </div>
        <span className="font-mono text-micro uppercase tracking-label text-ink-faint">
          automatic expiry · 10 min
        </span>
      </div>
    </footer>
  )
}
