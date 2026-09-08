'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, XCircle, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import * as authService from '@/lib/auth-service';
import { getApiErrorMessage } from '@/lib/api-client';

type Status = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);

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

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerification(resendEmail.trim().toLowerCase());
      setResendSent(true);
      toast.success('If an account exists, a new verification link was sent.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not resend verification link.'));
    } finally {
      setIsResending(false);
    }
  }

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
              <Button fullWidth className="mt-2">Continue to login</Button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <div className="w-full flex flex-col items-center gap-4">
            <XCircle className="h-10 w-10 text-[#EF4444]" />
            <p className="text-sm text-[#F1F5F4]">{errorMessage}</p>

            {resendSent ? (
              <div className="w-full rounded-btn border border-[#16A085]/30 bg-[#0D332D]/40 p-4 text-center">
                <p className="text-xs text-[#5EE0C1]">
                  A new verification link has been dispatched to <strong>{resendEmail}</strong> if registered.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResend} className="w-full flex flex-col gap-3 mt-2 text-left">
                <Input
                  label="Resend verification email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                />
                <Button type="submit" fullWidth isLoading={isResending} variant="secondary" className="gap-2">
                  <Mail size={16} />
                  Resend verification link
                </Button>
              </form>
            )}

            <Link href="/login" className="text-sm font-semibold text-[#16A085] hover:text-[#5EE0C1] hover:underline transition-colors mt-2">
              Back to login
            </Link>
          </div>
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
