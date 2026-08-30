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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D332D] text-xl font-bold text-[#5EE0C1] shadow-glow border border-[#117A65]">
            R
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F5F4]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[#9AA9A5]">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
