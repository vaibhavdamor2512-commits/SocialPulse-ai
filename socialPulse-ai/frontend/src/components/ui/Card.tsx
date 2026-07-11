/**
 * src/components/ui/Card.tsx
 */
import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  children: ReactNode;
}

export function Card({ hover, glow, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'card',
        hover && 'card-hover cursor-pointer',
        glow && 'hover:shadow-card-hover',
        'transition-all duration-200',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps { children: ReactNode; className?: string }
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps { children: ReactNode; className?: string }
export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-sm font-semibold text-white', className)}>
      {children}
    </h3>
  );
}

interface CardBodyProps { children: ReactNode; className?: string }
export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn(className)}>{children}</div>;
}
