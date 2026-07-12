'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, Trash2, Download, Pause, Play } from 'lucide-react';
import toast from 'react-hot-toast';

import { campaignsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockCampaigns } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatCurrency, formatDateRange, formatNumber, formatPercent } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { CampaignProgressBar } from '@/components/campaigns/CampaignProgressBar';
import { CampaignCalendarView } from '@/components/campaigns/CampaignCalendarView';
import { CampaignActivityTimeline } from '@/components/campaigns/CampaignActivityTimeline';
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge';
import type { Campaign, CampaignObjective, CampaignStatus } from '@/types';

const OBJECTIVES: Record<CampaignObjective, string> = {
  brand_awareness: 'Brand Awareness',
  lead_generation: 'Lead Generation',
  conversion: 'Conversion',
  engagement: 'Engagement',
  traffic: 'Traffic',
};

const _STATUS_OPTIONS: Array<{ value: CampaignStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
];

const FORM_TEMPLATE = {
  name: '',
  objective: 'brand_awareness',
  budget: 0,
  start_date: '',
  end_date: '',
  target_audience: '',
  platforms: 'instagram',
};

function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const campaignId = params?.id as string;
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<typeof FORM_TEMPLATE>(FORM_TEMPLATE);

  const campaignQuery = useQuery({
    queryKey: QUERY_KEYS.campaign(campaignId),
    queryFn: () => campaignsApi.get(campaignId),
    placeholderData: mockCampaigns.find((campaign) => campaign.id === campaignId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const campaign = campaignQuery.data;

  const updateMutation = useMutation({
    mutationFn: (body: Partial<Campaign>) => campaignsApi.update(campaignId, body),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns });
      queryClient.setQueryData(QUERY_KEYS.campaign(campaignId), updated);
      toast.success('Campaign updated successfully.');
      setEditOpen(false);
    },
    onError: () => {
      toast.error('Unable to update campaign. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => campaignsApi.delete(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.campaigns });
      toast.success('Campaign deleted successfully.');
      router.push('/campaigns');
    },
    onError: () => {
      toast.error('Unable to delete campaign. Please try again.');
    },
  });

  const toggleStatus = () => {
    if (!campaign) return;
    const nextStatus: CampaignStatus = campaign.status === 'active' ? 'paused' : 'active';
    updateMutation.mutate({ status: nextStatus });
  };

  const handleOpenEdit = () => {
    if (!campaign) return;
    setEditForm({
      name: campaign.name,
      objective: campaign.objective,
      budget: campaign.budget,
      start_date: campaign.start_date.slice(0, 10),
      end_date: campaign.end_date.slice(0, 10),
      target_audience: campaign.target_audience,
      platforms: campaign.platforms[0] ?? 'instagram',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = () => {
    if (!campaign) return;
    updateMutation.mutate({
      name: editForm.name,
      objective: editForm.objective as CampaignObjective,
      budget: Number(editForm.budget),
      start_date: editForm.start_date,
      end_date: editForm.end_date,
      target_audience: editForm.target_audience,
      platforms: [editForm.platforms as Campaign['platforms'][number]],
    });
  };

  const isLoading = campaignQuery.isLoading || updateMutation.isPending || deleteMutation.isPending;

  if (!campaign && !campaignQuery.isLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-text-muted">Campaign not found.</p>
        <Button variant="ghost" onClick={() => router.push('/campaigns')} className="mt-4">
          Back to campaigns
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push('/campaigns')}>
            Back to campaigns
          </Button>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">{campaign?.name ?? 'Campaign details'}</h1>
            <p className="text-xs text-text-muted max-w-2xl">
              Review campaign performance, timeline events, and budget health for your selected plan.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast('Exporting campaign details...')}>
            Export report
          </Button>
          <Button variant="ghost" size="sm" leftIcon={campaign?.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} onClick={toggleStatus} disabled={!campaign}>
            {campaign?.status === 'active' ? 'Pause campaign' : 'Activate campaign'}
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Edit3 className="w-4 h-4" />} onClick={handleOpenEdit} disabled={!campaign}>
            Edit campaign
          </Button>
          <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => deleteMutation.mutate()} disabled={!campaign}>
            Delete campaign
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-28 rounded-2xl bg-base-border" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-32 rounded-2xl bg-base-border" />
            <div className="h-32 rounded-2xl bg-base-border" />
            <div className="h-32 rounded-2xl bg-base-border" />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <Card className="p-4">
              <CardHeader>
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Campaign details</p>
                  <h2 className="text-xl font-semibold text-white mt-2">{campaign?.name}</h2>
                </div>
                <CampaignStatusBadge status={campaign?.status ?? 'draft'} />
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">Objective</p>
                    <p className="text-sm text-white mt-1">{campaign ? OBJECTIVES[campaign.objective] : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">Timeline</p>
                    <p className="text-sm text-white mt-1">{campaign ? formatDateRange(campaign.start_date, campaign.end_date) : '—'}</p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-base-surface border border-base-border p-4">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">Budget</p>
                    <p className="text-xl font-semibold text-white mt-2">{formatCurrency(campaign?.budget ?? 0)}</p>
                  </div>
                  <div className="rounded-2xl bg-base-surface border border-base-border p-4">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">Spent</p>
                    <p className="text-xl font-semibold text-white mt-2">{formatCurrency(campaign?.spent ?? 0)}</p>
                  </div>
                  <div className="rounded-2xl bg-base-surface border border-base-border p-4">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">Progress</p>
                    <p className="text-xl font-semibold text-white mt-2">{campaign?.progress_percent ?? 0}%</p>
                  </div>
                </div>
                <CampaignProgressBar percent={campaign?.progress_percent ?? 0} label="Campaign completion" />
              </CardBody>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="p-4">
                <CardHeader>
                  <CardTitle>Performance metrics</CardTitle>
                </CardHeader>
                <CardBody className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-base border border-base-border p-4">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">CTR</p>
                    <p className="text-white font-semibold mt-2">{formatPercent(campaign?.metrics.ctr ?? 0)}</p>
                  </div>
                  <div className="rounded-2xl bg-base border border-base-border p-4">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">ROAS</p>
                    <p className="text-white font-semibold mt-2">{formatNumber(campaign?.metrics.roas ?? 0)}</p>
                  </div>
                  <div className="rounded-2xl bg-base border border-base-border p-4">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">Clicks</p>
                    <p className="text-white font-semibold mt-2">{formatNumber(campaign?.metrics.clicks ?? 0)}</p>
                  </div>
                </CardBody>
              </Card>

              <Card className="p-4">
                <CardHeader>
                  <CardTitle>Assets & team</CardTitle>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="rounded-2xl bg-base-surface border border-base-border p-4">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">Team</p>
                    <div className="mt-3 space-y-3">
                      {campaign?.team?.map((member) => (
                        <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-base-border bg-base p-3">
                          <div>
                            <p className="text-sm text-white">{member.name}</p>
                            <p className="text-[11px] text-text-muted mt-1">{member.role}</p>
                          </div>
                          <span className="text-[10px] text-text-muted">{member.avatar_url ? 'Photo' : member.name.split(' ').map((word) => word[0]).join('')}</span>
                        </div>
                      )) ?? <p className="text-sm text-text-muted">No team members assigned.</p>}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-base-surface border border-base-border p-4">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted">Attachments</p>
                    <div className="mt-3 space-y-2">
                      {campaign?.attachments?.map((file) => (
                        <a key={file.id} href={file.url} className="block rounded-xl border border-base-border bg-base p-3 text-sm text-white hover:border-accent-indigo" target="_blank" rel="noreferrer">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-[11px] text-text-muted mt-0.5">{file.type} · {file.size}</p>
                            </div>
                            <Download className="w-4 h-4 text-text-muted" />
                          </div>
                        </a>
                      )) ?? <p className="text-sm text-text-muted">No attachments uploaded.</p>}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>Content calendar</CardTitle>
              </CardHeader>
              <CardBody>
                <CampaignCalendarView events={campaign?.calendar_events ?? []} />
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-4">
              <CardHeader>
                <CardTitle>Activity timeline</CardTitle>
              </CardHeader>
              <CardBody>
                <CampaignActivityTimeline items={campaign?.activity ?? []} />
              </CardBody>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <CardTitle>Notes & strategy</CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-sm leading-relaxed text-text-secondary">
                  {campaign?.notes ?? 'No campaign notes available. Add a note to capture strategy or next steps.'}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit campaign" size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Campaign name"
              value={editForm.name}
              onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Select
              label="Objective"
              value={editForm.objective}
              onChange={(event) => setEditForm((prev) => ({ ...prev, objective: event.target.value }))}
              options={Object.entries(OBJECTIVES).map(([value, label]) => ({ value, label }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Target audience"
              value={editForm.target_audience}
              onChange={(event) => setEditForm((prev) => ({ ...prev, target_audience: event.target.value }))}
            />
            <Select
              label="Primary platform"
              value={editForm.platforms}
              onChange={(event) => setEditForm((prev) => ({ ...prev, platforms: event.target.value }))}
              options={PLATFORM_OPTIONS}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Budget"
              type="number"
              value={editForm.budget}
              onChange={(event) => setEditForm((prev) => ({ ...prev, budget: Number(event.target.value) }))}
            />
            <Input
              label="Start date"
              type="date"
              value={editForm.start_date}
              onChange={(event) => setEditForm((prev) => ({ ...prev, start_date: event.target.value }))}
            />
            <Input
              label="End date"
              type="date"
              value={editForm.end_date}
              onChange={(event) => setEditForm((prev) => ({ ...prev, end_date: event.target.value }))}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-base-border">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button loading={updateMutation.isPending} onClick={handleEditSubmit}>Save changes</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

export default CampaignDetailPage;
