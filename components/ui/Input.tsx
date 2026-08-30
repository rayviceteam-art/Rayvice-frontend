'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

/**
 * FRONTEND-02 §7 — Input Fields.
 * Every input must support: label, placeholder, helper text, error
 * message, focus state, disabled state.
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = '', ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`rounded-control border bg-white px-3.5 py-2.5 text-sm text-text-primary outline-none transition-all placeholder:text-ash-400 focus:border-brand focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-ash-100/60 ${
            error ? 'border-error ring-1 ring-error' : 'border-border'
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-error">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
