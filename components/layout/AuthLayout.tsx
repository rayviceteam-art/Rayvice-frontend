import { ReactNode } from 'react';

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-charcoal text-lg font-bold text-white shadow-md border border-charcoal-dark/20">
            R
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
