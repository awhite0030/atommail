import type { Config } from 'tailwindcss'

/*
 * AtomMail Design System — Tailwind mapping.
 * Every value references tokens.css so CSS variables stay the single source of truth.
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: 'var(--c-void)',
        abyss: 'var(--c-abyss)',
        deep: 'var(--c-deep)',
        crust: 'var(--c-crust)',
        surface: 'var(--c-surface)',
        raised: 'var(--c-raised)',
        ink: {
          DEFAULT: 'var(--c-ink)',
          mist: 'var(--c-mist)',
          dust: 'var(--c-dust)',
          faint: 'var(--c-faint)',
        },
        iris: {
          violet: 'var(--c-iris-violet)',
          indigo: 'var(--c-iris-indigo)',
          cyan: 'var(--c-iris-cyan)',
          teal: 'var(--c-iris-teal)',
          pink: 'var(--c-iris-pink)',
          amber: 'var(--c-iris-amber)',
        },
        danger: 'var(--c-danger)',
        success: 'var(--c-success)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        hero: ['var(--text-hero)', { lineHeight: '0.95', letterSpacing: 'var(--tracking-tight)' }],
        h1: ['var(--text-h1)', { lineHeight: '1.05', letterSpacing: 'var(--tracking-tight)' }],
        h2: ['var(--text-h2)', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
        h3: ['var(--text-h3)', { lineHeight: '1.3', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
        pill: 'var(--r-pill)',
      },
      boxShadow: {
        glow: 'var(--glow-accent)',
        'glow-cyan': 'var(--glow-cyan)',
        panel: 'var(--shadow-panel)',
        raised: 'var(--shadow-raised)',
      },
      transitionTimingFunction: {
        soft: 'var(--ease-out-soft)',
        spring: 'var(--ease-spring)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur-base)',
        slow: 'var(--dur-slow)',
      },
      backgroundImage: {
        'grad-iris': 'var(--grad-iris)',
        'grad-iris-soft': 'var(--grad-iris-soft)',
        'grad-text': 'var(--grad-text)',
      },
    },
  },
  plugins: [],
}

export default config
