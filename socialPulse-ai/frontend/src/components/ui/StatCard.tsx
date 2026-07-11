/**
 * src/components/ui/StatCard.tsx
 * Metric summary card used on Dashboard and Analytics pages.
 */
import { cn } from '@/lib/utils';
import { growthColor, growthLabel } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  growth?: number;
  icon?: ReactNode;
  accentColor?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, growth, icon, accentColor = '#6172f3', className }: StatCardProps) {
  return (
    <div className={cn('card card-hover group', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</p>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-gradient">{value}</p>
      {(subtitle ?? growth !== undefined) && (
        <div className="flex items-center gap-2 mt-1">
          {growth !== undefined && (
            <span className={cn('text-xs font-semibold', growthColor(growth))}>
              {growthLabel(growth)}
            </span>
          )}
          {subtitle && <span className="text-xs text-text-muted">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
