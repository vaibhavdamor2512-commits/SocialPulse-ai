/**
 * src/components/ui/Badge.tsx
 */
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Variant = 'indigo' | 'purple' | 'green' | 'orange' | 'pink' | 'sky' | 'default';

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<Variant, string> = {
  indigo:  'bg-accent-indigo/15 text-accent-indigo border-accent-indigo/30',
  purple:  'bg-accent-purple/15 text-accent-purple border-accent-purple/30',
  green:   'bg-accent-green/15 text-accent-green border-accent-green/30',
  orange:  'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
  pink:    'bg-accent-pink/15 text-accent-pink border-accent-pink/30',
  sky:     'bg-accent-sky/15 text-accent-sky border-accent-sky/30',
  default: 'bg-base-border/50 text-text-secondary border-base-border',
};

export function Badge({ children, variant = 'default', size = 'md', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'badge border',
        variantStyles[variant],
        size === 'sm' && 'px-1.5 py-px text-[10px]',
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-accent-green':  variant === 'green',
          'bg-accent-orange': variant === 'orange',
          'bg-accent-indigo': variant === 'indigo',
          'bg-accent-purple': variant === 'purple',
          'bg-accent-sky':    variant === 'sky',
          'bg-text-muted':    variant === 'default',
        })} />
      )}
      {children}
    </span>
  );
}
