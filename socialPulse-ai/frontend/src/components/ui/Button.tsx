/**
 * src/components/ui/Button.tsx
 */
'use client';

import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'ghost' | 'danger' | 'outline';
type Size    = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary: [
    'bg-brand-gradient text-white font-semibold',
    'hover:opacity-90 active:opacity-80',
    'focus:ring-2 focus:ring-brand-indigo/60',
  ].join(' '),
  ghost: [
    'bg-transparent text-text-secondary border border-base-border',
    'hover:border-brand-indigo/40 hover:text-white',
    'focus:ring-2 focus:ring-brand-indigo/40',
  ].join(' '),
  danger: [
    'bg-red-500/10 text-red-400 border border-red-500/30',
    'hover:bg-red-500/20 hover:border-red-500/60',
    'focus:ring-2 focus:ring-red-500/40',
  ].join(' '),
  outline: [
    'bg-transparent text-text-primary border border-base-border',
    'hover:bg-base-surface hover:border-brand-indigo/30',
    'focus:ring-2 focus:ring-brand-indigo/30',
  ].join(' '),
};

const sizeStyles: Record<Size, string> = {
  sm:   'h-8  px-3 text-xs gap-1.5',
  md:   'h-9  px-4 text-sm gap-2',
  lg:   'h-11 px-6 text-sm gap-2',
  icon: 'h-9  w-9  p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-150 cursor-pointer select-none',
        'focus:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  )
);
Button.displayName = 'Button';
