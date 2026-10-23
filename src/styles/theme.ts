/**
 * TradeCraft Design Tokens & Theme (TypeScript)
 * Single source of truth for programmatic access (Canvas 2D, SVG Chart, JavaScript).
 * Perfectly synced with src/styles/tokens.css.
 */

export const THEME_COLORS = {
  // Profit / Bull / Live Mode (Sky Blue - Accessible & Colorblind Friendly)
  profit: {
    DEFAULT: '#38BDF8',
    light: '#7DD3FC',
    dark: '#0284C7',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.30)',
    glow: 'rgba(56, 189, 248, 0.20)',
  },

  // Loss / Bear / Sell Mode (Rose)
  loss: {
    DEFAULT: '#F43F5E',
    light: '#FB7185',
    dark: '#E11D48',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.30)',
    glow: 'rgba(244, 63, 94, 0.20)',
  },

  // Demo / Warning (Amber)
  demo: {
    DEFAULT: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.30)',
    glow: 'rgba(245, 158, 11, 0.20)',
  },

  // Brand (Financial Blue)
  brand: {
    DEFAULT: '#2962FF',
    hover: '#1D4ED8',
    light: '#60A5FA',
    bg: 'rgba(41, 98, 255, 0.12)',
    border: 'rgba(41, 98, 255, 0.30)',
  },

  // Background Surfaces
  bg: {
    canvas: '#0B0F19',
    surface: '#0F1523',
    panel: '#111827',
    elevated: '#161F33',
    input: '#141C2E',
    hover: '#1E293B',
  },

  // Borders & Lines
  border: {
    subtle: '#1E293B',
    default: '#334155',
    light: '#475569',
  },

  // Typography
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    muted: '#64748B',
    inverse: '#0B0F19',
  },

  // Asset Pillars
  pillars: {
    stocks: '#3B82F6',
    fiis: '#A855F7',
    fixedIncome: '#06B6D4',
    reserves: '#38BDF8',
  },
} as const;

export const BREAKPOINTS = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  '3xl': 1920,
} as const;

export const RADII = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
} as const;

export default THEME_COLORS;
