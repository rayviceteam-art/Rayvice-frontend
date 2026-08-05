'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { loginSchema, type LoginFormValues } from '@/lib/validators';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    try {
      await login(values);
      toast.success('Welcome back.');
      router.push('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid email or password.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Log in to Rayvice" subtitle="Welcome back — pick up right where you left off.">
      <div className="rounded-card bg-white p-8 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@business.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-brand-dark hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-brand-dark hover:underline">
            Start your free trial
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
