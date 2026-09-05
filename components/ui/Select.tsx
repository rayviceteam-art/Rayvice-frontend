'use client';

import { SelectHTMLAttributes, forwardRef, useId } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = '', children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-body2 font-medium text-text-secondary">
          {label}
        </label>
        <select
          id={selectId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`h-10 rounded border bg-input px-3 text-body1 text-text-primary focus:border-brand disabled:cursor-not-allowed disabled:bg-elevated disabled:text-text-disabled ${
            error ? 'border-error' : 'border-border hover:border-border-hover'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={errorId} role="alert" className="text-caption text-error">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = 'Select';
