/**
 * src/components/charts/ChartWrapper.tsx
 * Thin wrapper around Recharts — provides consistent sizing, dark theme,
 * responsive container, and a loading/empty state.
 */
'use client';

import type { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';

interface ChartWrapperProps {
  children: ReactNode;
  height?: number;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function ChartWrapper({
  children,
  height = 240,
  loading,
  empty,
  emptyMessage = 'No data available',
  className,
}: ChartWrapperProps) {
  if (loading) {
    return (
      <div
        style={{ height }}
        className={cn('flex items-center justify-center', className)}
      >
        <Spinner />
      </div>
    );
  }

  if (empty) {
    return (
      <div
        style={{ height }}
        className={cn('flex items-center justify-center', className)}
      >
        <p className="text-xs text-text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      {children as React.ReactElement}
    </ResponsiveContainer>
  );
}

// ── Chart theme constants (reusable in all chart components) ──────────────────
export const CHART_THEME = {
  gridColor: '#1e2535',
  axisColor: '#374151',
  tickColor: '#6b7280',
  tooltipBg: '#161b27',
  tooltipBorder: '#1e2535',
  tooltipText: '#e5e7eb',
  fontSize: 11,
  fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
} as const;
