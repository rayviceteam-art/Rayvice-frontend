'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';
import { useAuth } from '@/lib/auth-context';
import { getApiErrorMessage } from '@/lib/api-client';
import { registerSchema, type RegisterFormValues } from '@/lib/validators';

/**
 * FRONTEND-03 §11 — Free Trial Flow:
 * Sign Up -> Business Registration -> 3-Day Free Trial Activated -> Dashboard Access.
 * The backend activates the trial automatically on registration, so a
 * successful submit here logs the owner straight into their new business.
 */
export default function RegisterPage() {
  const { register: registerBusiness } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      const { confirmPassword, ...payload } = values;
      await registerBusiness(payload);
      toast.success('Business registered. Your 3-day free trial has started.');
      router.push('/dashboard');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not create your account.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Start your free trial" subtitle="3 days, full access, no credit card required.">
      <div className="rounded-card border border-border bg-white p-8 shadow-card">
        {/* 1st Priority: Direct Google Sign-up */}
        <div className="mb-5">
          <GoogleButton text="Sign up with Google" />
        </div>

        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-border" />
          <span className="absolute bg-white px-3 text-xs uppercase tracking-wider text-ash-400 font-medium">
            or sign up with email
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Business name"
            placeholder="Acme Home Services"
            error={errors.businessName?.message}
            {...register('businessName')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Business phone"
              placeholder="Optional"
              error={errors.businessPhone?.message}
              {...register('businessPhone')}
            />
            <Input
              label="Industry"
              placeholder="Optional"
              error={errors.industry?.message}
              {...register('industry')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label="Last name"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

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
              autoComplete="new-password"
              helperText="At least 8 characters, with uppercase, lowercase, and a number."
              error={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-text-secondary hover:text-charcoal focus:outline-none"
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
              className="absolute right-3 top-[38px] text-text-secondary hover:text-charcoal focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-charcoal hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
