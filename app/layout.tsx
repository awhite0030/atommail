import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'AtomMail — Premium AI Accounts & Subscriptions',
  description: 'Instant delivery. Premium AI software accounts — Cursor Pro, ChatGPT Business, Claude Max, Gemini. Automated. Reliable. Secure.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} min-h-screen bg-black text-white font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
