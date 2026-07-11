/**
 * src/components/dashboard/PlatformBreakdown.tsx
 * Per-platform metrics table: followers, engagement, reach, posts, growth.
 */
'use client';

import { PLATFORM_META, PLATFORMS } from '@/lib/constants';
import { formatNumber, formatPercent, growthColor, growthLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { AnalyticsOverview } from '@/types';

interface Props {
  data: AnalyticsOverview | undefined;
  loading: boolean;
}

const COLS = ['Followers', 'Engagement', 'Reach', 'Posts', 'Growth'] as const;

function SkeletonRow() {
  return (
    <tr className="border-t border-base-border">
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-base-border" />
          <div className="h-3 w-16 bg-base-border rounded animate-pulse" />
        </div>
      </td>
      {[0, 1, 2, 3, 4].map((i) => (
        <td key={i} className="py-3 px-3">
          <div className="h-3 w-12 bg-base-border rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

export function PlatformBreakdown({ data, loading }: Props) {
  return (
    <div className="card overflow-hidden">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Platform Breakdown</h3>
        <p className="text-xs text-text-muted mt-0.5">This period</p>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[460px]">
          <thead>
            <tr>
              <th className="text-left text-[10px] font-semibold text-text-muted uppercase tracking-wider pb-2 pl-4 pr-2">
                Platform
              </th>
              {COLS.map((c) => (
                <th
                  key={c}
                  className="text-right text-[10px] font-semibold text-text-muted uppercase tracking-wider pb-2 px-3"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading || !data
              ? [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
              : PLATFORMS.map((p) => {
                  const m = data.platforms[p];
                  const meta = PLATFORM_META[p];
                  return (
                    <tr key={p} className="border-t border-base-border group hover:bg-base-surface/40 transition-colors">
                      {/* Platform name */}
                      <td className="py-3 pl-4 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: meta.color }}
                          />
                          <span className="text-xs font-medium text-text-primary">{meta.label}</span>
                        </div>
                      </td>

                      {/* Followers */}
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs font-semibold text-text-primary">
                          {formatNumber(m.followers)}
                        </span>
                      </td>

                      {/* Engagement */}
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs font-semibold text-text-primary">
                          {formatPercent(m.engagement)}
                        </span>
                      </td>

                      {/* Reach */}
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs font-semibold text-text-primary">
                          {formatNumber(m.reach)}
                        </span>
                      </td>

                      {/* Posts */}
                      <td className="py-3 px-3 text-right">
                        <span className="text-xs font-semibold text-text-primary">
                          {m.posts}
                        </span>
                      </td>

                      {/* Growth */}
                      <td className="py-3 px-3 text-right">
                        <span className={cn('text-xs font-bold', growthColor(m.growth))}>
                          {growthLabel(m.growth)}
                        </span>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
