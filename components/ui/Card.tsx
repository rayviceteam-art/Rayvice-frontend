import { HTMLAttributes } from 'react';

/**
 * RAYVICE UI DESIGN SYSTEM — Cards
 * Normal: Background #131B1C, Border #253130, Radius 12px
 * Hover: Background #182122, Border #34413F
 * Highlighted: Background #0D332D, Border #117A65
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'highlighted';
  isInteractive?: boolean;
}

const variantStyles = {
  default: 'bg-[#131B1C] border-[#253130]',
  elevated: 'bg-[#182122] border-[#34413F]',
  highlighted: 'bg-[#0D332D] border-[#117A65]',
};

export function Card({
  variant = 'default',
  isInteractive = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-card border p-6 text-[#F1F5F4] shadow-card transition-all duration-150 ${
        variantStyles[variant]
      } ${
        isInteractive ? 'cursor-pointer hover:border-[#34413F] hover:bg-[#182122]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
