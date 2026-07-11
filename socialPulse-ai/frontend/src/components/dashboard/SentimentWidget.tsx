/**
 * src/components/dashboard/SentimentWidget.tsx
 * Watson NLP sentiment summary — donut arc, score, breakdown bars,
 * and per-platform scores.
 */
'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SentimentData } from '@/types';
import { PLATFORM_META, PLATFORMS } from '@/lib/constants';

interface Props {
  data: SentimentData | undefined;
  loading: boolean;
}

function SkeletonRow() {
  return <div className="h-3 rounded bg-base-border animate-pulse" />;
}

// Simple SVG arc for the score gauge
function ScoreArc({ score }: { score: number }) {
  const r = 44;
  const cx = 56;
  const cy = 56;
  const circumference = Math.PI * r; // half circle
  const progress = (score / 100) * circumference;
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#fb923c' : '#f87171';

  return (
    <svg width={112} height={64} viewBox="0 0 112 64" className="overflow-visible">
      {/* Track */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="#1e2535"
        strokeWidth={10}
        strokeLinecap="round"
      />
      {/* Progress */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
        style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
      />
      {/* Score text */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill={color} fontSize={20} fontWeight={800}>
        {score}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" fill="#9ca3af" fontSize={9}>
        / 100
      </text>
    </svg>
  );
}

export function SentimentWidget({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="card space-y-3">
        <div className="h-4 w-32 bg-base-border rounded animate-pulse" />
        <div className="flex justify-center py-4"><div className="w-28 h-14 bg-base-border rounded animate-pulse" /></div>
        {[0, 1, 2].map((i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-accent-green' : data.trend === 'down' ? 'text-red-400' : 'text-text-muted';

  const breakdownBars = [
    { label: 'Positive', pct: data.breakdown.positive, color: 'bg-accent-green' },
    { label: 'Neutral',  pct: data.breakdown.neutral,  color: 'bg-text-dim' },
    { label: 'Negative', pct: data.breakdown.negative, color: 'bg-red-400' },
  ];

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Sentiment Score</h3>
          <p className="text-xs text-text-muted mt-0.5">IBM Watson NLP</p>
        </div>
        <div className={cn('flex items-center gap-1 text-xs font-semibold', trendColor)}>
          <TrendIcon className="w-3.5 h-3.5" />
          {data.trend === 'stable' ? 'Stable' : `${data.score_change > 0 ? '+' : ''}${data.score_change}%`}
        </div>
      </div>

      {/* Arc gauge */}
      <div className="flex justify-center -mb-2">
        <ScoreArc score={data.overall_score} />
      </div>

      {/* Breakdown bars */}
      <div className="space-y-2">
        {breakdownBars.map(({ label, pct, color }) => (
          <div key={label} className="flex items-center gap-2">
            <span className="text-[10px] text-text-muted w-14 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-base-border rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%`, transition: 'width 0.6s ease-out' }} />
            </div>
            <span className="text-[10px] text-text-secondary w-7 text-right">{pct}%</span>
          </div>
        ))}
      </div>

      {/* Per-platform */}
      <div className="border-t border-base-border pt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {PLATFORMS.map((p) => {
          const ps = data.platform_sentiment[p];
          return (
            <div key={p} className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-text-muted truncate">{PLATFORM_META[p].label}</span>
              <span className="text-[10px] font-bold" style={{ color: PLATFORM_META[p].color }}>{ps?.score ?? '—'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
