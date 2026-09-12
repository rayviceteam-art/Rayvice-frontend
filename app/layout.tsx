import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.rayvice.com'),
  title: 'Rayvice — NDIS Sole-Trader Billing & Compliance OS',
  description: 'Automated billing, rate-splitting, and compliance OS for independent Australian NDIS Sole Traders.',
  applicationName: 'Rayvice',
  authors: [{ name: 'Rayvice Team', url: 'https://www.rayvice.com' }],
  keywords: ['NDIS', 'Sole Trader', 'NDIS Billing', 'Rate Splitting', 'Australia', 'Invoicing', 'Compliance'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/brand/app-icon.png', sizes: '1024x1024', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/brand/favicon.svg',
  },
  openGraph: {
    title: 'Rayvice — NDIS Sole-Trader Billing & Compliance OS',
    description: 'Automated billing, rate-splitting, and compliance OS for independent Australian NDIS Sole Traders.',
    url: 'https://www.rayvice.com',
    siteName: 'Rayvice',
    locale: 'en_AU',
    type: 'website',
    images: [
      {
        url: '/brand/og-image.png',
        width: 1920,
        height: 1080,
        alt: 'Rayvice — Precision in Motion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rayvice — NDIS Sole-Trader Billing & Compliance OS',
    description: 'Automated billing, rate-splitting, and compliance OS for independent Australian NDIS Sole Traders.',
    images: ['/brand/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
