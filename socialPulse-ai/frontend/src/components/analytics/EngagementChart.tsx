/**
 * src/components/analytics/EngagementChart.tsx
 * 30-day engagement rate timeline — LineChart per platform.
 * Toggleable series, identical pattern to FollowersChart.
 */
'use client';

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { ChartWrapper, CHART_THEME } from '@/components/charts/ChartWrapper';
import { PLATFORM_META, PLATFORMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { TimelinePoint } from '@/types';

interface Props { data: TimelinePoint[]; loading: boolean }

function shortDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function EngagementChart({ data, loading }: Props) {
  const [active, setActive] = useState<Set<string>>(new Set(PLATFORMS as unknown as string[]));

  const toggle = (p: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(p)) { if (next.size > 1) next.delete(p); } else next.add(p);
      return next;
    });

  const formatted = data.map((d) => ({ ...d, date: shortDate(d.date) }));

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Engagement Rate</h3>
          <p className="text-xs text-text-muted mt-0.5">% per platform · 30-day timeline</p>
        </div>
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
                  on ? 'opacity-100' : 'opacity-30 border-base-border text-text-muted',
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
        <LineChart data={formatted} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid stroke={CHART_THEME.gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} interval={6} />
          <YAxis tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          {/* Industry average reference line */}
          <ReferenceLine y={2.3} stroke="#374151" strokeDasharray="4 4" label={{ value: 'Avg 2.3%', fill: '#6b7280', fontSize: 9, position: 'right' }} />
          <Tooltip
            contentStyle={{ background: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: CHART_THEME.tooltipText }}
            formatter={(v: number) => [`${v}%`, '']}
          />
          {PLATFORMS.map((p) =>
            active.has(p) ? (
              <Line
                key={p}
                type="monotone"
                dataKey={p}
                name={PLATFORM_META[p].label}
                stroke={PLATFORM_META[p].color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: PLATFORM_META[p].color }}
              />
            ) : null
          )}
        </LineChart>
      </ChartWrapper>

      {/* Industry benchmark note */}
      <p className="text-[10px] text-text-dim mt-2">
        ── Dashed line = 2.3% industry average engagement rate
      </p>
    </div>
  );
}
