import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
          <Link
            href="/"
            className="inline-flex items-center justify-center h-20 sm:h-24 w-auto max-w-full overflow-hidden mb-6 focus:outline-none focus:ring-2 focus:ring-[#117A65] rounded-xl"
          >
            <Image
              src="/brand/rayvice-logo.svg"
              alt="Rayvice"
              width={320}
              height={213}
              priority
              className="w-[280px] sm:w-[320px] h-auto max-w-none shrink-0"
            />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[#F1F5F4]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[#9AA9A5]">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
