/**
 * src/components/dashboard/RecentCampaigns.tsx
 * Lists active/recent campaigns with status badge, budget bar, and AI score.
 */
'use client';

import Link from 'next/link';
import { Rocket, ArrowRight } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import type { Campaign } from '@/types';

interface Props {
  data: Campaign[];
  loading: boolean;
}

const STATUS_CONFIG: Record<Campaign['status'], { label: string; variant: 'green' | 'indigo' | 'orange' | 'default' }> = {
  active:    { label: 'Active',     variant: 'green'   },
  completed: { label: 'Completed',  variant: 'indigo'  },
  paused:    { label: 'Paused',     variant: 'orange'  },
  draft:     { label: 'Draft',      variant: 'default' },
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-base-border flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-36 bg-base-border rounded" />
        <div className="h-2 w-24 bg-base-border rounded" />
      </div>
      <div className="w-14 h-5 bg-base-border rounded" />
    </div>
  );
}

export function RecentCampaigns({ data, loading }: Props) {
  const campaigns = data.filter((c) => c.status !== 'completed').slice(0, 4);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Active Campaigns</h3>
          <p className="text-xs text-text-muted mt-0.5">{campaigns.length} running</p>
        </div>
        <Link
          href="/campaigns"
          className="flex items-center gap-1 text-xs text-accent-indigo hover:underline"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-base-border">
        {loading
          ? [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
          : campaigns.length === 0
            ? (
              <p className="text-xs text-text-muted py-4 text-center">No active campaigns</p>
            )
            : campaigns.map((c) => {
              const budgetPct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
              const statusConfig = STATUS_CONFIG[c.status] ?? {
  label: c.status || "Unknown",
  variant: "secondary",
};

const { label, variant } = statusConfig;

              return (
                <div key={c.id} className="py-3 group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center flex-shrink-0">
                        <Rocket className="w-3.5 h-3.5 text-accent-indigo" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">{c.name}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">
                          Ends {formatDate(c.end_date, 'short')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={variant} size="sm">{label}</Badge>
                      {c.ai_score > 0 && (
                        <span className="text-[10px] font-bold text-accent-purple bg-accent-purple/10 border border-accent-purple/20 px-1.5 py-0.5 rounded">
                          AI {c.ai_score}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Budget bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-base-border rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          budgetPct > 80 ? 'bg-red-400' : budgetPct > 50 ? 'bg-accent-orange' : 'bg-accent-green',
                        )}
                        style={{ width: `${budgetPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted whitespace-nowrap">
                      {formatCurrency(c.spent)} / {formatCurrency(c.budget)}
                    </span>
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
