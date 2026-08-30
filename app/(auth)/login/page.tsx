'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { loginSchema, type LoginFormValues } from '@/lib/validators';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <Card className="p-8">
        {/* 1st Priority: Direct Google Login */}
        <div className="mb-5">
          <GoogleButton text="Continue with Google" />
        </div>

        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-[#253130]" />
          <span className="absolute bg-[#131B1C] px-3 text-xs uppercase tracking-wider text-[#687572] font-medium">
            or continue with email
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@business.com"
            error={errors.email?.message}
            {...register('email')}
          />
          
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
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

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-[#9AA9A5] hover:text-[#5EE0C1] hover:underline transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Log in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#9AA9A5]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-[#16A085] hover:text-[#5EE0C1] hover:underline transition-colors">
            Start your free trial
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
