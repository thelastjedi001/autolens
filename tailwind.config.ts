import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#141414',
        accent: {
          DEFAULT: '#2563EB',
          hover: '#1d4ed8',
        },
      },
      fontFamily: {
        display: ['Satoshi', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 20px 40px -15px rgba(0,0,0,0.3)',
        lift: '0 8px 30px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}

export default config
