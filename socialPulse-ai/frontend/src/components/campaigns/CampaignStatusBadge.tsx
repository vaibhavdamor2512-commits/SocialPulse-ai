'use client';

import { Badge } from '@/components/ui/Badge';
import type { CampaignStatus } from '@/types';

const STATUS_VARIANT: Record<CampaignStatus, 'green' | 'indigo' | 'orange' | 'pink' | 'default'> = {
  draft: 'default',
  scheduled: 'sky',
  active: 'green',
  paused: 'orange',
  completed: 'indigo',
  cancelled: 'pink',
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} size="sm" className={className}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
