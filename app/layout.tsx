import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rayvice — NDIS Sole-Trader Billing & Compliance OS',
  description: 'Automated billing, rate-splitting, and compliance OS for independent Australian NDIS Sole Traders.',
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
