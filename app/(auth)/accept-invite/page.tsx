'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import * as businessService from '@/lib/business-service';
import { getApiErrorMessage } from '@/lib/api-client';
import { acceptInviteSchema, type AcceptInviteFormValues } from '@/lib/validators';

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormValues>({ resolver: zodResolver(acceptInviteSchema) });

  if (!token) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EF4444]/10 text-[#EF4444]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#F1F5F4]">Invalid Invitation Link</h2>
            <p className="mt-1 text-sm text-[#9AA9A5]">
              This invitation link is missing or invalid. Please check your invitation email or ask your business owner to resend the invite.
            </p>
          </div>
          <Link href="/login" className="w-full">
            <Button fullWidth variant="secondary">
              Back to Login
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  async function onSubmit(values: AcceptInviteFormValues) {
    setIsSubmitting(true);
    try {
      await businessService.acceptInvite(token as string, values.password);
      toast.success('Account activated! You can now log in with your new password.');
      router.push('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'This invitation link has expired or has already been used.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-8">
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-[#16A085]/30 bg-[#0D332D]/40 p-3.5 text-xs text-[#5EE0C1]">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[#16A085]" />
        <span>You have been invited to join Rayvice. Create your personal password below to activate your account.</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="relative">
          <Input
            label="Create password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            helperText="At least 8 characters, with uppercase, lowercase, and a number."
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-[#9AA9A5] hover:text-[#F1F5F4] focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] text-[#9AA9A5] hover:text-[#F1F5F4] focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting} className="mt-2">
          Activate Account & Join Team
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#9AA9A5]">
        Already have an active account?{' '}
        <Link href="/login" className="font-semibold text-[#16A085] hover:text-[#5EE0C1] hover:underline transition-colors">
          Log in
        </Link>
      </p>
    </Card>
  );
}

export default function AcceptInvitePage() {
  return (
    <AuthLayout
      title="Accept Team Invitation"
      subtitle="Set your password to activate your Rayvice team member account."
    >
      <Suspense fallback={null}>
        <AcceptInviteForm />
      </Suspense>
    </AuthLayout>
  );
}
