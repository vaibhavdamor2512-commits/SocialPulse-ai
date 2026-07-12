import { cn } from '@/lib/utils';

interface Props {
  status: 'invited' | 'negotiating' | 'active' | 'completed' | 'declined';
}

const statusStyles: Record<Props['status'], string> = {
  invited: 'bg-accent-sky/10 text-accent-sky border-accent-sky/30',
  negotiating: 'bg-accent-orange/10 text-accent-orange border-accent-orange/30',
  active: 'bg-accent-green/10 text-accent-green border-accent-green/30',
  completed: 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/30',
  declined: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function InfluencerStatusBadge({ status }: Props) {
  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]', statusStyles[status])}>
      {status}
    </span>
  );
}
