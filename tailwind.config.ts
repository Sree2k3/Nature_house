import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Biophilic Nature Tokens ──────────────────────────
        nature: {
          linen:   '#fcfbf7', // warm organic background
          forest:  '#0f281e', // deep botanical green – headings
          moss:    '#2d6a4f', // sage secondary – care chips, badges
          leaf:    '#e8f5e9', // soft leaf mist – plant chip fills
          sage:    '#52836f', // mid-tone botanical accent
          stone:   '#1e293b', // river stone – body copy
          border:  '#e7e5e4', // frosted hairline borders
          muted:   '#78716c', // muted warm gray
        },
        // ── Aquatic / Glass Tokens ───────────────────────────
        aqua: {
          deep:  '#03045e', // deep ocean heading accent
          azure: '#0077b6', // crystal-clear water badge
          mist:  '#e0f2fe', // aquarium chip fills
          glass: 'rgba(255,255,255,0.75)', // glassmorphism surface
        },
        // ── Conversion / Action Tokens ───────────────────────
        whatsapp: {
          DEFAULT: '#25d366',
          hover:   '#20ba5a',
          dark:    '#128c4a',
        },
        // ── Semantic Status Tokens ───────────────────────────
        status: {
          open:   '#22c55e', // open badge green
          closed: '#94a3b8', // closed badge slate
          amber:  '#f59e0b', // low-stock warning
        },
      },

      fontFamily: {
        sans:    ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },

      borderRadius: {
        '4xl': '2rem',
      },

      boxShadow: {
        '2xs':        '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'xs':         '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft':       '0 4px 20px rgba(0,0,0,0.05)',
        'soft-lift':  '0 8px 30px rgba(0,0,0,0.08)',
        'card-hover': '0 16px 48px rgba(0,0,0,0.12)',
        'glass-glow': '0 0 20px rgba(45,106,79,0.10)',
        'aqua-glow':  '0 0 20px rgba(0,119,182,0.12)',
        'whatsapp':   '0 4px 14px rgba(37,211,102,0.35)',
      },

      backgroundImage: {
        // subtle ambient glow overlays for hero section
        'nature-glow':
          'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(45,106,79,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(0,119,182,0.06) 0%, transparent 60%)',
        // linen paper texture overlay
        'linen-texture':
          "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.015' fill-rule='evenodd'/%3E%3C/svg%3E\")",
      },

      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      // glass-morphism utility (used via arbitrary values)
      backdropBlur: {
        '2xs': '1px',
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
