/**
 * src/components/analytics/PeriodSelector.tsx
 * Period pill-toggle: 7d / 30d / 90d / 180d
 */
'use client';

import { cn } from '@/lib/utils';

export const PERIODS = [
  { value: '7d',   label: '7 days'  },
  { value: '30d',  label: '30 days' },
  { value: '90d',  label: '90 days' },
  { value: '180d', label: '180 days'},
] as const;

export type Period = typeof PERIODS[number]['value'];

interface Props {
  value: Period;
  onChange: (v: Period) => void;
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-base-sunken p-1 rounded-lg border border-base-border">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
            value === p.value
              ? 'bg-base-surface text-white border border-base-border shadow-sm'
              : 'text-text-muted hover:text-text-secondary',
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
