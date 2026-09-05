import type { Config } from 'tailwindcss';

/**
 * RAYVICE — DARK UI DESIGN SYSTEM
 * 
 * Palette:
 * - Neutral: Background (#080B0D), Sidebar (#0A0F10), Surface (#131B1C), Elevated (#182122), Input (#0E1617)
 * - Borders: Default (#253130), Hover (#34413F)
 * - Brand/Primary: Default (#16A085), Hover (#1DB89A), Light/Accent (#5EE0C1), Dark (#117A65), Bg/Active (#0D332D)
 * - Text: Primary (#F1F5F4), Secondary (#9AA9A5), Muted (#687572), Disabled (#3F4C49)
 * - Semantic: Success (#22C55E), Warning (#F59E0B), Error (#EF4444), Info (#3B82F6)
 */
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Main Surfaces & Neutrals
        background: {
          DEFAULT: '#080B0D',
          sidebar: '#0A0F10',
          surface: '#131B1C',
          elevated: '#182122',
          input: '#0E1617',
        },
        surface: {
          DEFAULT: '#131B1C',
          elevated: '#182122',
          card: '#131B1C',
          input: '#0E1617',
          sidebar: '#0A0F10',
        },
        // Borders
        border: {
          DEFAULT: '#253130',
          hover: '#34413F',
          focus: '#16A085',
        },
        // Brand / Primary Teal-Emerald Palette
        brand: {
          DEFAULT: '#16A085',
          hover: '#1DB89A',
          light: '#5EE0C1',
          accent: '#5EE0C1',
          dark: '#117A65',
          bg: '#0D332D',
        },
        primary: {
          DEFAULT: '#16A085',
          hover: '#1DB89A',
          light: '#5EE0C1',
          dark: '#117A65',
          bg: '#0D332D',
        },
        // Text
        text: {
          primary: '#F1F5F4',
          secondary: '#9AA9A5',
          muted: '#687572',
          disabled: '#3F4C49',
        },
        // Semantic / Status Colors
        status: {
          success: {
            DEFAULT: '#22C55E',
            bg: '#0B2B1B',
            border: '#166534',
            text: '#D1FAE5',
          },
          warning: {
            DEFAULT: '#F59E0B',
            bg: '#2A210B',
            border: '#92400E',
            text: '#FEF3C7',
          },
          error: {
            DEFAULT: '#EF4444',
            bg: '#2B1010',
            border: '#991B1B',
            text: '#FEE2E2',
          },
          info: {
            DEFAULT: '#3B82F6',
            bg: '#0C1D35',
            border: '#1D4ED8',
            text: '#DBEAFE',
          },
        },
        elevated: '#182122',
        input: '#0E1617',
        success: {
          DEFAULT: '#22C55E',
          bg: '#0B2B1B',
          border: '#166534',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#2A210B',
          border: '#92400E',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: '#2B1010',
          border: '#991B1B',
        },
        info: '#3B82F6',
      },
      fontSize: {
        h1: ['32px', { lineHeight: '1.25', fontWeight: '700' }],
        h2: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['20px', { lineHeight: '1.35', fontWeight: '600' }],
        h4: ['16px', { lineHeight: '1.4', fontWeight: '600' }],
        body1: ['16px', { lineHeight: '1.55', fontWeight: '400' }],
        body2: ['14px', { lineHeight: '1.55', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        control: '8px',
        btn: '8px',
        input: '8px',
        card: '12px',
        modal: '16px',
        section: '16px',
      },
      boxShadow: {
        card: '0 4px 16px rgba(0, 0, 0, 0.20)',
        modal: '0 16px 40px rgba(0, 0, 0, 0.35)',
        glow: '0 0 20px rgba(22, 160, 133, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
