'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * FRONTEND-02 §6 — Button Design.
 * Primary: filled, brand color, rounded corners.
 * Secondary: outline style. Danger: error color.
 * Disabled: low contrast, not clickable.
 */
type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark disabled:bg-brand/40',
  secondary: 'bg-transparent border border-brand text-brand-dark hover:bg-brand/10 disabled:opacity-40',
  danger: 'bg-error text-white hover:bg-red-600 disabled:bg-error/40',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading = false, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`flex w-full items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
