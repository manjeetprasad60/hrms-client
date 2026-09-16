/**
 * HRIS Client Admin — Design Tokens
 *
 * Single source of truth for design tokens used across the application.
 * All visual styles consume these tokens to maintain consistency, accessibility,
 * and enterprise-grade aesthetics.
 */

export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px - Small text / badge / table header
    sm: '0.8125rem',  // 13px - Label text / secondary info
    base: '0.875rem', // 14px - Standard body text / inputs / buttons
    md: '1rem',       // 16px - Subheadings / callouts
    lg: '1.125rem',   // 18px - Card titles
    xl: '1.25rem',    // 20px - Section headings
    '2xl': '1.5rem',  // 24px - Page headings
    '3xl': '1.75rem', // 28px - Primary hero / page title
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
  },
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em', // Table headers
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',    // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  8: '2rem',    // 32px
  10: '2.5rem', // 40px
  12: '3rem',   // 48px
  16: '4rem',   // 64px
} as const;

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  elevation1: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  elevation2: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  elevation3: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
  focusRing: '0 0 0 2px #ffffff, 0 0 0 4px #0f766e',
} as const;

export const colors = {
  primary: {
    default: '#0f766e', // Teal 700 - Professional, calm, trustworthy
    hover: '#115e59',   // Teal 800
    active: '#134e4a',  // Teal 900
    light: '#f0fdfa',   // Teal 50
    contrast: '#ffffff',
    ring: 'rgba(15, 118, 110, 0.25)',
  },
  secondary: {
    default: '#475569', // Slate 600
    hover: '#334155',   // Slate 700
    active: '#1e293b',  // Slate 800
    light: '#f1f5f9',   // Slate 100
    contrast: '#ffffff',
  },
  background: {
    app: '#f8fafc',     // Canvas background
    subtle: '#f1f5f9',  // Sunken background / secondary rows
    hover: '#e2e8f0',   // Interactive hover fill
  },
  surface: {
    default: '#ffffff', // Cards, modals, popovers
    elevated: '#ffffff',
    sunken: '#f8fafc',
  },
  border: {
    subtle: '#f1f5f9',
    default: '#e2e8f0', // Slate 200
    strong: '#cbd5e1',  // Slate 300
    focus: '#0f766e',   // Primary teal
  },
  text: {
    primary: '#0f172a',   // Slate 900 - Headings & critical text
    secondary: '#475569', // Slate 600 - Standard body text
    muted: '#64748b',     // Slate 500 - Secondary metadata / labels
    inverse: '#ffffff',   // White text on dark surfaces
  },
  semantic: {
    success: {
      text: '#065f46',    // Emerald 800
      bg: '#ecfdf5',      // Emerald 50
      border: '#a7f3d0',  // Emerald 200
    },
    warning: {
      text: '#92400e',    // Amber 800
      bg: '#fffbeb',      // Amber 50
      border: '#fde68a',  // Amber 200
    },
    error: {
      text: '#991b1b',    // Red 800
      bg: '#fef2f2',      // Red 50
      border: '#fecaca',  // Red 200
    },
    info: {
      text: '#075985',    // Sky 800
      bg: '#f0f9ff',      // Sky 50
      border: '#bae6fd',  // Sky 200
    },
  },
} as const;

export const tokens = {
  typography,
  spacing,
  borderRadius,
  shadows,
  colors,
} as const;

export default tokens;
