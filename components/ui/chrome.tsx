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
    <nav className="sticky top-0 z-nav border-b border-strong bg-void/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="font-display text-lg font-medium tracking-tight text-prism">
          atom<span className="text-iris-violet">mail</span>
        </Link>

        <div className="hidden items-center gap-8 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-mono text-micro uppercase tracking-label text-prism-dust transition-fast hover:text-iris-cyan"
            >
              {l.label}
            </Link>
          ))}
          <span className="font-mono text-micro uppercase tracking-label text-prism-faint">
            inbox / 10 min
          </span>
        </div>

        <button
          className="sm:hidden font-mono text-micro uppercase tracking-label text-prism-dust"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu"
        >
          {open ? 'close' : 'menu'}
        </button>
      </div>

      {open && (
        <div className="border-t border-strong bg-void/95 px-6 py-4 sm:hidden">
          <div className="grid gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-mono text-micro uppercase tracking-label text-prism-dust"
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
    <footer className="border-t border-strong px-6 py-8">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-display text-sm text-prism-mist">
          atom<span className="text-iris-violet">mail</span>
        </Link>
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/faq" className="text-small text-prism-dust transition-fast hover:text-prism">FAQ</Link>
          <Link href="/privacy" className="text-small text-prism-dust transition-fast hover:text-prism">Privacy</Link>
          <Link href="/about" className="text-small text-prism-dust transition-fast hover:text-prism">About</Link>
          <a href="/design" className="text-small text-prism-faint transition-fast hover:text-iris-cyan">Design</a>
        </div>
        <span className="font-mono text-micro uppercase tracking-label text-prism-faint">
          automatic expiry · 10 min
        </span>
      </div>
    </footer>
  )
}
