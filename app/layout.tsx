import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono, Fraunces } from 'next/font/google'
import './styles/tokens.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['300', '400', '500', '600'] })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-plex-mono', weight: ['400', '500'] })
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', weight: ['300', '400', '500'], style: ['normal', 'italic'] })

export const metadata: Metadata = {
  title: 'AtomMail — Temporary Email',
  description: 'A private, temporary inbox that expires automatically after ten minutes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plexMono.variable} ${fraunces.variable} min-h-screen bg-void font-sans text-ink antialiased`}>
        {children}
      </body>
    </html>
  )
}
