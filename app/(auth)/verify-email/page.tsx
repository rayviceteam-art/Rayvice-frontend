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
    <Card>
      <div className="flex flex-col items-center gap-3 text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-brand" />
            <p className="text-sm text-text-secondary">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-10 w-10 text-success" />
            <p className="text-sm text-text-primary">Your email has been verified.</p>
            <Link href="/login" className="w-full">
              <Button className="mt-2">Continue to login</Button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-10 w-10 text-error" />
            <p className="text-sm text-text-primary">{errorMessage}</p>
            <Link href="/login" className="text-sm font-semibold text-brand-dark hover:underline">
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
