import { HTMLAttributes } from 'react';

/**
 * FRONTEND-02 §8 — Cards use rounded corners, soft shadow, clean spacing.
 */
export function Card({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-card bg-white p-8 shadow-card ${className}`} {...props}>
      {children}
    </div>
  );
}
