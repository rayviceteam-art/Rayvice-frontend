import type { Config } from 'tailwindcss';

/**
 * Color tokens sourced directly from FRONTEND-02 — Design System,
 * UI Components & Visual Standards. Do not introduce new colors
 * outside this palette without updating that document first.
 */
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pearl: {
          50: '#FAFBFD',
          100: '#F5F6F8',
          200: '#EAEEF2',
          DEFAULT: '#F5F6F8',
        },
        charcoal: {
          50: '#F1F3F5',
          100: '#E1E4E8',
          300: '#8C94A0',
          500: '#47505F',
          700: '#2A303C',
          DEFAULT: '#1E232A',
          dark: '#111418',
        },
        ash: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          DEFAULT: '#64748B',
          dark: '#475569',
        },
        background: {
          DEFAULT: '#F5F6F8', // Pearl Primary Background
          secondary: '#EAEEF2', // Pearl Secondary Background
        },
        brand: {
          DEFAULT: '#1E232A', // Charcoal Primary Brand
          dark: '#111418', // Deep Charcoal
          ash: '#64748B', // Ash Accent
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        text: {
          primary: '#1E232A', // Charcoal Primary Text
          secondary: '#64748B', // Ash Secondary Text
          muted: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0', // Ash Border
          focus: '#1E232A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        control: '10px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(30, 35, 42, 0.06), 0 2px 6px -1px rgba(30, 35, 42, 0.04)',
        glow: '0 0 15px rgba(30, 35, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
