'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          className="inline-flex items-center gap-2 border border-white/10 rounded-full px-3.5 py-1 mb-8"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-400 font-medium">All systems operational</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-gradient">Premium AI Accounts.</span>
          <br />
          <span className="text-gradient">Instant Delivery.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
          className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Cursor Pro, ChatGPT Business, Claude Max, Gemini — activated in seconds.
          No manual steps. No waiting.
        </motion.p>

        {/* CTA group */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="#products"
            className="bg-white text-black text-sm font-medium px-6 py-2.5 rounded-full hover:bg-zinc-200 transition-all duration-200 active:scale-[0.97]"
          >
            Browse Products
          </a>
          <a
            href="#features"
            className="border border-white/10 text-zinc-300 text-sm font-medium px-6 py-2.5 rounded-full hover:border-white/20 hover:text-white transition-all duration-200 active:scale-[0.97]"
          >
            How It Works
          </a>
        </motion.div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 flex items-center justify-center gap-6 text-xs text-zinc-600"
        >
          <span>256-bit encrypted</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>Instant delivery</span>
          <span className="h-1 w-1 rounded-full bg-zinc-700" />
          <span>24/7 uptime</span>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
