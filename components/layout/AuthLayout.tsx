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
          <img
            src="/brand/rayvice-mark-dark.svg"
            alt="Rayvice logo"
            className="mx-auto mb-4 h-14 w-14"
          />
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F5F4]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[#9AA9A5]">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
