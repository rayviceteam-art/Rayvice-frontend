'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#182122',
            color: '#F1F5F4',
            border: '1px solid #253130',
            borderRadius: '8px',
            fontSize: '14px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#0B2B1B' },
            style: {
              border: '1px solid #166534',
            },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#2B1010' },
            style: {
              border: '1px solid #991B1B',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
