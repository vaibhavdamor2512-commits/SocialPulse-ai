'use client';

import { formatRelativeTime } from '@/lib/utils';
import type { CampaignActivityItem } from '@/types';

interface CampaignActivityTimelineProps {
  items: CampaignActivityItem[];
}

export function CampaignActivityTimeline({ items }: CampaignActivityTimelineProps) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-base-border bg-base-surface p-4 text-sm text-text-muted">
        No activity recorded for this campaign yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-base-border bg-base p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{item.action}</p>
              <p className="text-xs text-text-muted mt-1">{item.actor}</p>
            </div>
            <span className="text-[11px] text-text-muted whitespace-nowrap">{formatRelativeTime(item.timestamp)}</span>
          </div>
          <p className="text-sm text-text-secondary mt-3">{item.details}</p>
        </div>
      ))}
    </div>
  );
}
