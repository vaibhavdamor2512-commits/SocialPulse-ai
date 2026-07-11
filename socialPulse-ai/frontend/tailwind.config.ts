import type { Config } from 'tailwindcss';

const config: Config = {
  // ── Content sources ─────────────────────────────────────────────────────────
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // ── Dark mode strategy ──────────────────────────────────────────────────────
  // Uses the 'class' strategy so <html class="dark"> activates dark mode.
  // next-themes will manage the class toggle.
  darkMode: 'class',

  theme: {
    extend: {
      // ── Color palette ───────────────────────────────────────────────────────
      colors: {
        // Backgrounds
        base: {
          DEFAULT: '#0f1117',    // page background
          surface: '#161b27',   // card / panel
          sunken: '#0d1117',    // code blocks, deep wells
          border: '#1e2535',    // dividers
        },
        // Brand gradient stops
        brand: {
          indigo: '#6172f3',
          purple: '#a855f7',
          pink: '#ec4899',
        },
        // Semantic text
        text: {
          primary: '#e5e7eb',
          secondary: '#9ca3af',
          muted: '#6b7280',
          dim: '#374151',
        },
        // Accent colors (charts, badges, status)
        accent: {
          indigo: '#818cf8',
          purple: '#c084fc',
          green: '#4ade80',
          orange: '#fb923c',
          pink: '#f472b6',
          sky: '#38bdf8',
          blue: '#60a5fa',
        },
      },

      // ── Typography ───────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['-apple-system', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },

      // ── Border radius ─────────────────────────────────────────────────────────
      borderRadius: {
        card: '12px',
        chip: '999px',
      },

      // ── Box shadow ────────────────────────────────────────────────────────────
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4)',
        'card-hover': '0 4px 16px rgba(97,114,243,0.15)',
        glow: '0 0 20px rgba(97,114,243,0.25)',
      },

      // ── Background gradients ─────────────────────────────────────────────────
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6172f3, #a855f7, #ec4899)',
        'brand-gradient-sm': 'linear-gradient(135deg, #6172f3, #a855f7)',
        'surface-gradient': 'linear-gradient(135deg, rgba(97,114,243,0.1), rgba(168,85,247,0.1))',
      },

      // ── Animation ─────────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse_glow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(97,114,243,0)' },
          '50%': { boxShadow: '0 0 16px 4px rgba(97,114,243,0.3)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'slide-in-left': 'slide-in-left 0.35s ease-out both',
        pulse_glow: 'pulse_glow 2s ease-in-out infinite',
      },
    },
  },

  plugins: [],
};

export default config;
