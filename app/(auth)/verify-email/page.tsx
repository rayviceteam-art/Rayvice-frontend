'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import * as authService from '@/lib/auth-service';
import { getApiErrorMessage } from '@/lib/api-client';

type Status = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('This verification link is missing or invalid.');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((error) => {
        setStatus('error');
        setErrorMessage(getApiErrorMessage(error, 'This verification link has expired or is invalid.'));
      });
  }, [token]);

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-[#16A085]" />
            <p className="text-sm text-[#9AA9A5]">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-10 w-10 text-[#22C55E]" />
            <p className="text-sm text-[#F1F5F4]">Your email has been verified.</p>
            <Link href="/login" className="w-full">
              <Button className="mt-2">Continue to login</Button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-10 w-10 text-[#EF4444]" />
            <p className="text-sm text-[#F1F5F4]">{errorMessage}</p>
            <Link href="/login" className="text-sm font-semibold text-[#16A085] hover:text-[#5EE0C1] hover:underline transition-colors">
              Back to login
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout title="Email verification">
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </AuthLayout>
  );
}
