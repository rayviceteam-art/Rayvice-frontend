'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as authService from '@/lib/auth-service';
import { getApiErrorMessage } from '@/lib/api-client';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validators';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await authService.forgotPassword(values);
      // Backend intentionally returns the same message whether or not the
      // email exists, to avoid leaking which emails are registered.
      setIsSent(true);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to get back in.">
      <Card className="p-8">
        {isSent ? (
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-[#22C55E]" />
            <p className="text-sm text-[#F1F5F4]">
              If an account with that email exists, a password reset link is on its way. Check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@business.com"
              error={errors.email?.message}
              {...register('email')}
            />
            {submitError && <p className="text-sm font-medium text-[#EF4444]">{submitError}</p>}
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Send reset link
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#9AA9A5]">
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-[#16A085] hover:text-[#5EE0C1] hover:underline transition-colors">
            Back to login
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
