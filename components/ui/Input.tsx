'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

/**
 * FRONTEND-02 §7 — Input Fields.
 * Every input must support: label, placeholder, helper text, error
 * message, focus state, disabled state.
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#9AA9A5]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`rounded-input border bg-[#0E1617] px-3.5 py-2.5 text-sm text-[#F1F5F4] outline-none transition-all placeholder:text-[#687572] hover:border-[#34413F] focus:border-[#16A085] focus:ring-1 focus:ring-[#16A085] disabled:cursor-not-allowed disabled:bg-[#182122] disabled:text-[#3F4C49] disabled:border-[#253130] ${
            error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' : 'border-[#253130]'
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-[#EF4444]">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-[#9AA9A5]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
