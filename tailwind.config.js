/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: '475px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        // Semantic Profit / Bull / Live
        profit: {
          DEFAULT: 'var(--color-profit, #38BDF8)',
          light: 'var(--color-profit-light, #7DD3FC)',
          dark: 'var(--color-profit-dark, #0284C7)',
          bg: 'var(--color-profit-bg, rgba(56, 189, 248, 0.12))',
          border: 'var(--color-profit-border, rgba(56, 189, 248, 0.30))',
        },
        bull: {
          DEFAULT: 'var(--color-profit, #38BDF8)',
          light: 'var(--color-profit-light, #7DD3FC)',
          dark: 'var(--color-profit-dark, #0284C7)',
          bg: 'var(--color-profit-bg, rgba(56, 189, 248, 0.12))',
        },
        // Semantic Loss / Bear / Sell
        loss: {
          DEFAULT: 'var(--color-loss, #F43F5E)',
          light: 'var(--color-loss-light, #FB7185)',
          dark: 'var(--color-loss-dark, #E11D48)',
          bg: 'var(--color-loss-bg, rgba(244, 63, 94, 0.12))',
          border: 'var(--color-loss-border, rgba(244, 63, 94, 0.30))',
        },
        bear: {
          DEFAULT: 'var(--color-loss, #F43F5E)',
          light: 'var(--color-loss-light, #FB7185)',
          dark: 'var(--color-loss-dark, #E11D48)',
          bg: 'var(--color-loss-bg, rgba(244, 63, 94, 0.12))',
        },
        // Semantic Demo / Amber
        demo: {
          DEFAULT: 'var(--color-demo, #F59E0B)',
          light: 'var(--color-demo-light, #FBBF24)',
          dark: 'var(--color-demo-dark, #D97706)',
          bg: 'var(--color-demo-bg, rgba(245, 158, 11, 0.12))',
          border: 'var(--color-demo-border, rgba(245, 158, 11, 0.30))',
        },
        // Background Surfaces
        bg: {
          main: 'var(--bg-canvas, #0B0F19)',
          canvas: 'var(--bg-canvas, #0B0F19)',
          card: 'var(--bg-surface, #0F1523)',
          surface: 'var(--bg-surface, #0F1523)',
          panel: 'var(--bg-panel, #111827)',
          elevated: 'var(--bg-elevated, #161F33)',
          input: 'var(--bg-input, #141C2E)',
          hover: 'var(--bg-hover, #1E293B)',
        },
        // Borders
        border: {
          subtle: 'var(--border-subtle, #1E293B)',
          default: 'var(--border-default, #334155)',
          light: 'var(--border-light, #475569)',
        },
        // TradeCraft Brand
        brand: {
          DEFAULT: 'var(--color-brand, #2962FF)',
          hover: 'var(--color-brand-hover, #1D4ED8)',
          light: 'var(--color-brand-light, #60A5FA)',
        },
        // Text
        textColor: {
          primary: 'var(--text-primary, #F8FAFC)',
          secondary: 'var(--text-secondary, #94A3B8)',
          muted: 'var(--text-muted, #64748B)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: 'var(--radius-xs, 4px)',
        sm: 'var(--radius-sm, 6px)',
        md: 'var(--radius-md, 8px)',
        lg: 'var(--radius-lg, 12px)',
        xl: 'var(--radius-xl, 16px)',
        '2xl': 'var(--radius-2xl, 20px)',
        '3xl': 'var(--radius-3xl, 24px)',
      }
    },
  },
  plugins: [],
}
