'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as authService from '@/lib/auth-service';
import { getApiErrorMessage } from '@/lib/api-client';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validators';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  if (!token) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="h-10 w-10 text-[#F59E0B]" />
          <p className="text-sm text-[#F1F5F4]">
            This reset link is missing or invalid. Request a new one to continue.
          </p>
          <Link href="/forgot-password" className="text-sm font-semibold text-[#16A085] hover:text-[#5EE0C1] hover:underline transition-colors">
            Request a new link
          </Link>
        </div>
      </Card>
    );
  }

  async function onSubmit(values: ResetPasswordFormValues) {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...payload } = values;
      await authService.resetPassword(token as string, payload);
      toast.success('Password reset. Please log in with your new password.');
      router.push('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'This reset link has expired or is invalid.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          helperText="At least 8 characters, with uppercase, lowercase, and a number."
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
