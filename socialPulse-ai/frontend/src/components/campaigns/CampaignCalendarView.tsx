import { formatDate } from '@/lib/utils';
import type { CampaignCalendarEvent } from '@/types';
import { platformLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CampaignCalendarViewProps {
  events: CampaignCalendarEvent[];
}

const EVENT_STATUS_STYLES: Record<CampaignCalendarEvent['status'], string> = {
  planned: 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/20',
  published: 'bg-accent-green/10 text-accent-green border-accent-green/20',
  review: 'bg-accent-orange/10 text-accent-orange border-accent-orange/20',
};

export function CampaignCalendarView({ events }: CampaignCalendarViewProps) {
  const grouped = events.reduce<Record<string, CampaignCalendarEvent[]>>((acc, event) => {
    const day = formatDate(event.date, 'short');
    acc[day] = acc[day] ?? [];
    acc[day].push(event);
    return acc;
  }, {});

  const days = Object.keys(grouped);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-base-border bg-base-surface p-4 text-sm text-text-muted">
        No calendar events scheduled for this campaign.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-border bg-base-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Monthly calendar</h3>
        <span className="text-[11px] text-text-muted">{days.length} active days</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {days.map((day) => (
          <div key={day} className="rounded-2xl border border-base-border bg-base p-3">
            <p className="text-[11px] uppercase tracking-wider text-text-muted mb-2">{day}</p>
            <div className="space-y-2">
              {grouped[day].map((event) => (
                <div key={event.id} className="rounded-xl border border-base-border bg-base-surface p-3">
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  <p className="text-[11px] text-text-muted mt-1">{platformLabel(event.platform)}</p>
                  <span className={cn('inline-flex items-center gap-2 rounded-full border px-2 py-1 text-[10px] font-medium', EVENT_STATUS_STYLES[event.status])}>
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
