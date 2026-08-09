import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'near-black': '#090909',
        'almost-white': '#f7f9fa',
        'soft-white': '#f0f0f0',
        steel: '#828384',
        graphite: '#474747',
        iron: '#423738',
        ash: '#6b6b6b',
        'signal-violet': '#af50ff',
        'lavender-mist': '#e1bdff',
      },
      fontFamily: {
        sans: ['var(--font-whyte-inktrap)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-whyte-inktrap-mono)', 'IBM Plex Mono', 'ui-monospace', 'monospace'],
        display: ['var(--font-grandslang)', 'Lora', 'ui-serif', 'serif'],
      },
      borderRadius: {
        cards: '19.2px',
        pills: '1584px',
        buttons: '8px',
        smallcontrols: '6px',
      },
      boxShadow: {
        subtle: 'rgba(16, 24, 40, 0.05) 0px 1px 2px 0px',
      },
    },
  },
  plugins: [],
}

export default config
