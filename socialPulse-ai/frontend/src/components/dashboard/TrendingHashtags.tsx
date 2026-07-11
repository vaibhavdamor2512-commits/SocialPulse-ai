/**
 * src/components/dashboard/TrendingHashtags.tsx
 * Top trending hashtags table with trend arrows and reach bars.
 */
'use client';

import { TrendingUp, TrendingDown, Minus, Hash } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import type { TrendingHashtag } from '@/types';

interface Props {
  data: TrendingHashtag[];
  loading: boolean;
}

function TrendIcon({ dir }: { dir: 'up' | 'down' | 'stable' }) {
  if (dir === 'up')     return <TrendingUp  className="w-3.5 h-3.5 text-accent-green" />;
  if (dir === 'down')   return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-text-muted" />;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-2.5 animate-pulse">
      <div className="w-4 h-3 bg-base-border rounded flex-shrink-0" />
      <div className="flex-1 h-3 bg-base-border rounded" />
      <div className="w-12 h-3 bg-base-border rounded" />
      <div className="w-16 h-2 bg-base-border rounded" />
    </div>
  );
}

export function TrendingHashtags({ data, loading }: Props) {
  const maxReach = Math.max(...(data.map((d) => d.reach)), 1);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Trending Hashtags</h3>
          <p className="text-xs text-text-muted mt-0.5">Top 8 by reach</p>
        </div>
        <Hash className="w-4 h-4 text-text-muted" />
      </div>

      <div className="divide-y divide-base-border">
        {loading
          ? [0, 1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)
          : data.slice(0, 8).map((tag, idx) => (
              <div key={tag.tag} className="flex items-center gap-3 py-2.5 group">
                {/* Rank */}
                <span className="text-[10px] font-bold text-text-dim w-4 flex-shrink-0 text-right">
                  {idx + 1}
                </span>

                {/* Tag + trend */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-accent-indigo truncate">
                      {tag.tag}
                    </span>
                    <TrendIcon dir={tag.trend} />
                    <span
                      className={cn(
                        'text-[9px] font-bold',
                        tag.trend === 'up'   ? 'text-accent-green' :
                        tag.trend === 'down' ? 'text-red-400' : 'text-text-muted',
                      )}
                    >
                      {tag.pct_change > 0 ? '+' : ''}{tag.pct_change.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-base-border rounded-full overflow-hidden max-w-[80px]">
                      <div
                        className="h-full rounded-full bg-brand-gradient"
                        style={{ width: `${(tag.reach / maxReach) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted">{formatNumber(tag.reach)} reach</span>
                  </div>
                </div>

                {/* Posts */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-text-primary">{formatNumber(tag.posts)}</p>
                  <p className="text-[9px] text-text-muted">posts</p>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
