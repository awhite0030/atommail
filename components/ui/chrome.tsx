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
        <Link
          href="/"
          aria-label="atommail home"
          className="grid min-h-11 place-items-center font-display text-xl font-normal tracking-tight text-ink"
        >
          atommail
        </Link>

        <div className="hidden items-center gap-10 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="grid place-items-center py-4 font-sans text-small uppercase tracking-[0.08em] text-ink-mist transition-fast hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          className="grid min-h-11 place-items-center px-3 font-mono text-micro uppercase tracking-label text-ink-mist sm:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu"
        >
          {open ? 'close' : 'menu'}
        </button>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-void px-6 py-2 sm:hidden">
          <div className="grid">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="grid min-h-14 place-items-start items-center py-4 font-sans text-small uppercase tracking-[0.08em] text-ink-mist"
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
      {/* Mobile: stacked grid with full-width tap rows;
          Desktop: single centered row */}
      <div className="mx-auto grid max-w-[1200px] gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <Link
          href="/"
          className="grid min-h-11 place-items-start font-display text-base text-ink"
        >
          atommail
        </Link>
        <nav className="grid grid-cols-2 gap-x-6 sm:flex sm:flex-wrap sm:items-center sm:gap-x-8">
          <Link href="/faq" className="grid min-h-11 place-items-start text-small text-ink-mist transition-fast hover:text-ink">FAQ</Link>
          <Link href="/privacy" className="grid min-h-11 place-items-start text-small text-ink-mist transition-fast hover:text-ink">Privacy</Link>
          <Link href="/about" className="grid min-h-11 place-items-start text-small text-ink-mist transition-fast hover:text-ink">About</Link>
          <a href="/design" className="grid min-h-11 place-items-start text-small text-ink-mist transition-fast hover:text-ink">Design</a>
        </nav>
        <span className="font-mono text-micro uppercase tracking-label text-ink-mist sm:ml-auto">
          automatic expiry · 10 min
        </span>
      </div>
    </footer>
  )
}
