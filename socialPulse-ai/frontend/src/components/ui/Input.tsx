/**
 * src/components/ui/Input.tsx
 */
import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftElement, rightElement, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <span className="absolute left-3 text-text-muted pointer-events-none">
              {leftElement}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-base',
              leftElement  && 'pl-9',
              rightElement && 'pr-9',
              error && 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/30',
              className,
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 text-text-muted">
              {rightElement}
            </span>
          )}
        </div>
        {(error ?? hint) && (
          <p className={cn('text-xs', error ? 'text-red-400' : 'text-text-muted')}>
            {error ?? hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
