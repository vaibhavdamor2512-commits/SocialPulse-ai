/**
 * src/components/analytics/PlatformComparison.tsx
 * Grouped bar chart: compare all 4 platforms on a chosen metric.
 * Metric selector: engagement / reach / followers / posts.
 */
'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ChartWrapper, CHART_THEME } from '@/components/charts/ChartWrapper';
import { PLATFORM_META, PLATFORMS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import type { AnalyticsOverview } from '@/types';

interface Props { data: AnalyticsOverview | undefined; loading: boolean }

const METRICS = [
  { value: 'followers',  label: 'Followers'        },
  { value: 'engagement', label: 'Engagement Rate %' },
  { value: 'reach',      label: 'Reach'             },
  { value: 'posts',      label: 'Posts'             },
  { value: 'growth',     label: 'Growth %'          },
] as const;

type MetricKey = typeof METRICS[number]['value'];

function tickFmt(metric: MetricKey) {
  return (v: number) => {
    if (metric === 'engagement' || metric === 'growth') return `${v}%`;
    return formatNumber(v);
  };
}

export function PlatformComparison({ data, loading }: Props) {
  const [metric, setMetric] = useState<MetricKey>('followers');

  const chartData = data
    ? [
        {
          name: 'Platforms',
          Instagram: data.platforms.instagram[metric],
          Twitter:   data.platforms.twitter[metric],
          LinkedIn:  data.platforms.linkedin[metric],
          Facebook:  data.platforms.facebook[metric],
        },
      ]
    : [];

  const fmt = tickFmt(metric);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Platform Comparison</h3>
          <p className="text-xs text-text-muted mt-0.5">Side-by-side platform performance</p>
        </div>
        {/* Metric selector */}
        <div className="flex gap-1 flex-wrap">
          {METRICS.map(m => (
            <button
              key={m.value}
              onClick={() => setMetric(m.value)}
              className={`text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-all duration-150 ${
                metric === m.value
                  ? 'bg-brand-indigo/20 text-accent-indigo border-brand-indigo/40'
                  : 'text-text-muted border-base-border hover:text-text-secondary hover:border-brand-indigo/20'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ChartWrapper height={240} loading={loading} empty={chartData.length === 0}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barGap={8}>
          <CartesianGrid stroke={CHART_THEME.gridColor} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: CHART_THEME.tickColor, fontSize: CHART_THEME.fontSize }} tickLine={false} axisLine={false} tickFormatter={fmt} />
          <Tooltip
            contentStyle={{ background: CHART_THEME.tooltipBg, border: `1px solid ${CHART_THEME.tooltipBorder}`, borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [fmt(v), '']}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: CHART_THEME.tickColor }} />
          {PLATFORMS.map(p => (
            <Bar
              key={p}
              dataKey={p.charAt(0).toUpperCase() + p.slice(1)}
              fill={PLATFORM_META[p].color}
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          ))}
        </BarChart>
      </ChartWrapper>
    </div>
  );
}
