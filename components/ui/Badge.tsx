import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  const variantStyles = {
    default: 'bg-[#182122] text-[#9AA9A5] border border-[#253130]',
    brand: 'bg-[#0D332D] text-[#5EE0C1] border border-[#117A65]',
    success: 'bg-[#0B2B1B] text-[#22C55E] border border-[#166534]',
    warning: 'bg-[#2A210B] text-[#F59E0B] border border-[#92400E]',
    danger: 'bg-[#2B1010] text-[#EF4444] border border-[#991B1B]',
    info: 'bg-[#0C1D35] text-[#3B82F6] border border-[#1D4ED8]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
