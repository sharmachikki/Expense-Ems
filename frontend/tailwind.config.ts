import type { Config } from 'tailwindcss';

// Color/type/radius values ported 1:1 from EMS-ExpenseEasy33.html's :root
// tokens, so Tailwind utilities (bg-ink, text-gold, etc.) stay consistent
// with the original demo rather than drifting toward Tailwind's defaults.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1B2430', soft: '#2A3645' },
        paper: { DEFAULT: '#F7F5F0', dim: '#EFEBE2' },
        slate: { DEFAULT: '#5C6B7A', light: '#8C99A6' },
        line: '#D9D3C6',
        gold: { DEFAULT: '#B8860B', soft: '#E8D9B0' },
        green: { DEFAULT: '#2F6B4F', bg: '#E6EFE9' },
        amber: { DEFAULT: '#9A6A14', bg: '#F4E9D2' },
        red: { DEFAULT: '#A8412C', bg: '#F3E2DD' },
        purple: { DEFAULT: '#5B4B8A', bg: '#EFEAF6' },
        teal: { DEFAULT: '#2F6B6B', bg: '#E3EEEE' },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '2px',
      },
      spacing: {
        sidebar: '240px',
      },
    },
  },
  plugins: [],
} satisfies Config;
