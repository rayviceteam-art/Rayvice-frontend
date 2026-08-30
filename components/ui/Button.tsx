'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * RAYVICE UI DESIGN SYSTEM — Buttons
 * Primary: #16A085 -> Hover: #1DB89A -> Pressed: #117A65
 * Secondary: Transparent -> Border #34413F -> Hover #131B1C & Border #16A085
 * Disabled: Bg #182122, Text #3F4C49
 */
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[#16A085] text-white hover:bg-[#1DB89A] active:bg-[#117A65] shadow-card disabled:bg-[#182122] disabled:text-[#3F4C49] disabled:border-transparent',
  secondary:
    'bg-transparent border border-[#34413F] text-[#F1F5F4] hover:bg-[#131B1C] hover:border-[#16A085] active:bg-[#0D332D] disabled:bg-[#182122] disabled:text-[#3F4C49] disabled:border-[#253130]',
  danger:
    'bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#991B1B] disabled:bg-[#2B1010] disabled:text-[#687572]',
  ghost:
    'bg-transparent text-[#9AA9A5] hover:text-[#F1F5F4] hover:bg-[#131B1C] disabled:text-[#3F4C49]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading = false, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`flex w-full items-center justify-center gap-2 rounded-btn px-4 py-2.5 text-sm font-semibold transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:shadow-none ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
