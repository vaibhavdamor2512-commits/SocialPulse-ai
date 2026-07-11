/**
 * src/components/analytics/SentimentDeep.tsx
 * Deep sentiment panel: score gauge, emotion radar (bar), keyword cloud,
 * per-platform sentiment table — all from Watson NLP.
 */
'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CHART_THEME } from '@/components/charts/ChartWrapper';
import { PLATFORM_META, PLATFORMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { capitalize } from '@/lib/utils';
import type { SentimentData } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props { data: SentimentData | undefined; loading: boolean }

const EMOTION_COLOR: Record<string, string> = {
  joy:          '#4ade80',
  trust:        '#6172f3',
  anticipation: '#fb923c',
  sadness:      '#60a5fa',
  anger:        '#f87171',
  fear:         '#a855f7',
  surprise:     '#f472b6',
  disgust:      '#94a3b8',
};

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? 'text-accent-green' : score >= 40 ? 'text-accent-orange' : 'text-red-400';
  const bg    = score >= 70 ? 'bg-accent-green/10 border-accent-green/20'
              : score >= 40 ? 'bg-accent-orange/10 border-accent-orange/20'
              : 'bg-red-400/10 border-red-400/20';
  return (
    <div className={cn('flex flex-col items-center px-4 py-3 rounded-xl border', bg)}>
      <p className={cn('text-2xl font-black', color)}>{score}</p>
      <p className="text-[10px] text-text-muted mt-0.5 capitalize">{label}</p>
    </div>
  );
}

export function SentimentDeep({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="grid md:grid-cols-2 gap-5">
        {[0,1,2,3].map(i => (
          <div key={i} className="card h-48 animate-pulse bg-base-surface" />
        ))}
      </div>
    );
  }

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-accent-green' : data.trend === 'down' ? 'text-red-400' : 'text-text-muted';

  const emotionRadarData = Object.entries(data.emotions).map(([name, value]) => ({
    subject: capitalize(name),
    value: Math.round(value * 100),
    fullMark: 100,
  }));

  return (
    <div className="grid md:grid-cols-2 gap-5">
      {/* ── Overall score + breakdown ─────────────────────────────────── */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Overall Sentiment</h3>
            <p className="text-xs text-text-muted">IBM Watson NLP · 5-class classification</p>
          </div>
          <div className={cn('flex items-center gap-1 text-xs font-bold', trendColor)}>
            <TrendIcon className="w-3.5 h-3.5" />
            {data.score_change > 0 ? '+' : ''}{data.score_change}% vs prev
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <p className="text-5xl font-black text-gradient">{data.overall_score}</p>
            <p className="text-xs text-text-muted mt-1">/ 100 · {capitalize(data.label)}</p>
          </div>
          <div className="flex-1 space-y-2">
            {[
              { key: 'positive', label: 'Positive', color: 'bg-accent-green' },
              { key: 'neutral',  label: 'Neutral',  color: 'bg-text-dim'     },
              { key: 'negative', label: 'Negative', color: 'bg-red-400'      },
            ].map(({ key, label, color }) => {
              const pct = data.breakdown[key as keyof typeof data.breakdown];
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-14 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-2 bg-base-border rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%`, transition: 'width 0.5s ease-out' }} />
                  </div>
                  <span className="text-[10px] font-semibold text-text-secondary w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top keywords */}
        <div>
          <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Top keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {data.top_keywords.map((kw) => (
              <span key={kw} className="text-[11px] px-2 py-0.5 rounded-chip bg-accent-indigo/10 border border-accent-indigo/20 text-accent-indigo font-medium">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Emotion radar ─────────────────────────────────────────────── */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-1">Emotion Profile</h3>
        <p className="text-xs text-text-muted mb-3">Watson NLP tone analysis</p>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={emotionRadarData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
            <PolarGrid stroke={CHART_THEME.gridColor} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: CHART_THEME.tickColor, fontSize: 10 }} />
            <Radar name="Emotion" dataKey="value" stroke="#6172f3" fill="#6172f3" fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Emotion bars ──────────────────────────────────────────────── */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-3">Emotion Breakdown</h3>
        <div className="space-y-2.5">
          {Object.entries(data.emotions).sort(([, a], [, b]) => b - a).map(([emotion, value]) => (
            <div key={emotion} className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted w-20 capitalize">{emotion}</span>
              <div className="flex-1 h-2 bg-base-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(value * 100)}%`, background: EMOTION_COLOR[emotion] ?? '#6172f3' }}
                />
              </div>
              <span className="text-[10px] font-semibold text-text-secondary w-8 text-right">
                {Math.round(value * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Per-platform sentiment scores ─────────────────────────────── */}
      <div className="card">
        <h3 className="text-sm font-semibold text-white mb-3">Platform Sentiment</h3>
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map((p) => {
            const ps = data.platform_sentiment[p];
            return (
              <ScoreBadge key={p} score={ps?.score ?? 0} label={PLATFORM_META[p].label} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
