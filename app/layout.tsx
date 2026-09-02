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
  openGraph: {
    title: 'Rayvice — NDIS Sole-Trader Billing & Compliance OS',
    description: 'Automated billing, rate-splitting, and compliance OS for independent Australian NDIS Sole Traders.',
    url: 'https://www.rayvice.com',
    siteName: 'Rayvice',
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rayvice — NDIS Sole-Trader Billing & Compliance OS',
    description: 'Automated billing, rate-splitting, and compliance OS for independent Australian NDIS Sole Traders.',
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
