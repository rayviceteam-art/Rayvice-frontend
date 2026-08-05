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
        background: {
          DEFAULT: '#FFF8E7', // Primary Background
          secondary: '#FFD77A', // Secondary Background
        },
        brand: {
          DEFAULT: '#E6A520', // Primary Brand Color
          dark: '#7A4A00', // Primary Dark
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        text: {
          primary: '#1F2937',
          secondary: '#6B7280',
        },
        border: {
          DEFAULT: '#E5E7EB',
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
        card: '0 2px 12px rgba(31, 41, 55, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
