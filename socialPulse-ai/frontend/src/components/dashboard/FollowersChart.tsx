/**
 * src/components/dashboard/FollowersChart.tsx
 * 30-day followers timeline — stacked area chart per platform.
 * Platform toggle tabs to show/hide individual series.
 */
'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { ChartWrapper, CHART_THEME } from '@/components/charts/ChartWrapper';
import { PLATFORM_META, PLATFORMS } from '@/lib/constants';
import { cn, formatNumber } from '@/lib/utils';
import type { TimelinePoint } from '@/types';

interface Props {
  data: TimelinePoint[];
  loading: boolean;
}

// Short weekday label from ISO date
function shortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function FollowersChart({ data, loading }: Props) {
  const [active, setActive] = useState<Set<string>>(
    new Set(PLATFORMS as unknown as string[])
  );

  const toggle = (p: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(p)) { if (next.size > 1) next.delete(p); }
      else next.add(p);
      return next;
    });

  const formatted = data.map((d) => ({ ...d, date: shortDate(d.date) }));

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Follower Growth</h3>
          <p className="text-xs text-text-muted mt-0.5">30-day timeline</p>
        </div>
        {/* Platform toggles */}
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => {
            const meta = PLATFORM_META[p];
            const on = active.has(p);
            return (
              <button
                key={p}
                onClick={() => toggle(p)}
                className={cn(
                  'text-[10px] font-semibold px-2 py-1 rounded-chip border transition-all duration-150',
                  on
                    ? 'opacity-100 border-current'
                    : 'opacity-30 border-base-border text-text-muted',
                )}
                style={on ? { color: meta.color, borderColor: meta.border } : {}}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <ChartWrapper height={220} loading={loading} empty={data.length === 0}>
        <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            {PLATFORMS.map((p) => (
              <linearGradient key={p} id={`grad-${p}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={PLATFORM_META[p].color} stopOpacity={0.18} />
                <stop offset="95%" stopColor={PLATFORM_META[p].color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke={CHART_THEME.gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} interval={6} />
          <YAxis tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} tickFormatter={(v) => formatNumber(v)} />
          <Tooltip
            contentStyle={{ background: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: CHART_THEME.tooltipText }}
            itemStyle={{ color: CHART_THEME.tooltipText }}
            formatter={(v: number) => [formatNumber(v), '']}
          />
          {PLATFORMS.map((p) =>
            active.has(p) ? (
              <Area
                key={p}
                type="monotone"
                dataKey={p}
                name={PLATFORM_META[p].label}
                stroke={PLATFORM_META[p].color}
                fill={`url(#grad-${p})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ) : null
          )}
        </AreaChart>
      </ChartWrapper>
    </div>
  );
}
