import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono, Lora } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-whyte-inktrap', weight: ['300', '400', '500', '700'] })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-whyte-inktrap-mono', weight: ['400'] })
const lora = Lora({ subsets: ['latin'], variable: '--font-grandslang', weight: ['400'], style: ['italic'] })

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
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${plexMono.variable} ${lora.variable} min-h-screen bg-near-black text-almost-white font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
