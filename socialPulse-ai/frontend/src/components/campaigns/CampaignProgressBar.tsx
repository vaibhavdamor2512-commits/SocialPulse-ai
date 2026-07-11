import { cn } from '@/lib/utils';

interface CampaignProgressBarProps {
  percent: number;
  label?: string;
}

export function CampaignProgressBar({ percent, label }: CampaignProgressBarProps) {
  const displayPercent = Math.max(0, Math.min(100, percent));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span>{label ?? 'Progress'}</span>
        <span>{displayPercent}%</span>
      </div>
      <div className="h-2 rounded-full bg-base-border overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            displayPercent >= 80 ? 'bg-accent-green' : displayPercent >= 50 ? 'bg-accent-indigo' : 'bg-accent-orange',
          )}
          style={{ width: `${displayPercent}%` }}
        />
      </div>
    </div>
  );
}
