'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, ChevronRight, Rocket, BarChart3, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { campaignsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockCampaigns } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatCurrency, formatDate, formatDateRange, formatNumber, formatPercent, platformLabel } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { CampaignStatusBadge } from '@/components/campaigns/CampaignStatusBadge';
import type { Campaign, CampaignObjective, CampaignStatus } from '@/types';

const STATUS_OPTIONS: Array<{ value: CampaignStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const OBJECTIVES: Record<CampaignObjective, string> = {
  brand_awareness: 'Brand Awareness',
  lead_generation: 'Lead Generation',
  conversion: 'Conversion',
  engagement: 'Engagement',
  traffic: 'Traffic',
};

const STATUS_BADGE_VARIANTS: Record<CampaignStatus, 'green' | 'indigo' | 'orange' | 'sky' | 'pink' | 'default'> = {
  draft: 'default',
  scheduled: 'sky',
  active: 'green',
  paused: 'orange',
  completed: 'indigo',
  cancelled: 'pink',
};

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
];

const FORM_TEMPLATE = {
  name: '',
  objective: 'brand_awareness',
  budget: 5_000,
  target_audience: '',
  platforms: 'instagram',
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 14 * 864_000_00).toISOString().slice(0, 10),
};

function CampaignPage() {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<typeof FORM_TEMPLATE>(FORM_TEMPLATE);

  const queryClient = useQueryClient();

  const campaignsQuery = useQuery({
    queryKey: QUERY_KEYS.campaigns,
    queryFn: campaignsApi.list,
    placeholderData: mockCampaigns,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (body: Omit<Campaign, 'id' | 'spent' | 'metrics' | 'ai_score' | 'created_at'>) =>
      campaignsApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.campaigns);
      toast.success('Campaign created successfully.');
      setCreateOpen(false);
      setCreateForm(FORM_TEMPLATE);
    },
    onError: () => {
      toast.error('Unable to create campaign. Please try again later.');
    },
  });

  const campaigns = campaignsQuery.data ?? mockCampaigns;
  const visibleCampaigns = useMemo(
    () => campaigns.filter((campaign) => !deletedIds.includes(campaign.id)),
    [campaigns, deletedIds],
  );

  const filteredCampaigns = useMemo(() => {
    return visibleCampaigns.filter((campaign) => {
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      const matchesSearch = [campaign.name, campaign.target_audience, OBJECTIVES[campaign.objective]]
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [visibleCampaigns, statusFilter, searchQuery]);

  const campaignCounts = useMemo(() => ({
    total: visibleCampaigns.length,
    active: visibleCampaigns.filter((campaign) => campaign.status === 'active').length,
    completed: visibleCampaigns.filter((campaign) => campaign.status === 'completed').length,
    draft: visibleCampaigns.filter((campaign) => campaign.status === 'draft').length,
  }), [visibleCampaigns]);

  const selected = selectedCampaign ?? visibleCampaigns[0] ?? null;
  const PAGE_SIZE = 6;
  const pageCount = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedCampaigns = filteredCampaigns.slice(pageStart, pageStart + PAGE_SIZE);
  const allSelected = pagedCampaigns.length > 0 && pagedCampaigns.every((navCampaign) => selectedIds.includes(navCampaign.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(pagedCampaigns.map((campaign) => campaign.id));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected campaign(s)?`);
    if (!confirmed) return;
    setDeletedIds((prev) => Array.from(new Set([...prev, ...selectedIds])));
    setSelectedIds([]);
    toast.success(`${selectedIds.length} campaign(s) deleted.`);
  };

  const exportSelected = () => {
    const selectedCampaigns = visibleCampaigns.filter((campaign) => selectedIds.includes(campaign.id));
    if (!selectedCampaigns.length) {
      toast('Select at least one campaign to export.');
      return;
    }

    const rows = [
      ['Name', 'Status', 'Objective', 'Start Date', 'End Date', 'Budget', 'Spent', 'Platforms', 'Audience'],
      ...selectedCampaigns.map((campaign) => [
        campaign.name,
        campaign.status,
        OBJECTIVES[campaign.objective],
        formatDate(campaign.start_date, 'short'),
        formatDate(campaign.end_date, 'short'),
        campaign.budget.toString(),
        campaign.spent.toString(),
        campaign.platforms.map(platformLabel).join('; '),
        campaign.target_audience,
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campaigns-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateSubmit = () => {
    if (!createForm.name || !createForm.target_audience) {
      toast.error('Please provide a campaign name and target audience.');
      return;
    }

    createMutation.mutate({
      name: createForm.name,
      status: 'draft',
      objective: createForm.objective as CampaignObjective,
      budget: Number(createForm.budget),
      spent: 0,
      start_date: createForm.start_date,
      end_date: createForm.end_date,
      platforms: [createForm.platforms as Campaign['platforms'][number]],
      target_audience: createForm.target_audience,
      metrics: { ctr: 0, roas: 0, impressions: 0, clicks: 0 },
      ai_score: 0,
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <Rocket className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Campaign Planner</h1>
            <p className="text-xs text-text-muted max-w-xl">
              Plan, review, and optimize campaigns with AI-backed insights and performance snapshots.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => campaignsQuery.refetch()}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-white border border-base-border hover:border-brand-indigo/40 rounded-lg px-3 py-2 transition-all disabled:opacity-50"
            disabled={campaignsQuery.isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${campaignsQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Button
            onClick={() => setCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New campaign
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total campaigns', value: campaignCounts.total, accent: 'text-accent-indigo' },
          { label: 'Running now', value: campaignCounts.active, accent: 'text-accent-green' },
          { label: 'Completed', value: campaignCounts.completed, accent: 'text-accent-purple' },
          { label: 'Drafts', value: campaignCounts.draft, accent: 'text-text-muted' },
        ].map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">{item.label}</p>
            <div className="flex items-center justify-between gap-3">
              <p className={`text-3xl font-black ${item.accent}`}>{item.value}</p>
              <BarChart3 className={`w-5 h-5 ${item.accent}`} />
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Campaign list</CardTitle>
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as CampaignStatus | 'all');
                    setCurrentPage(1);
                  }}
                  options={STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                  className="w-44"
                />
                <Input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search campaigns..."
                  className="w-full max-w-md"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={exportSelected}>
                  Export
                </Button>
                <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />} onClick={handleDeleteSelected} disabled={!selectedIds.length}>
                  Delete selected
                </Button>
              </div>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-[13px]">
              <thead>
                <tr className="text-xs uppercase text-text-muted border-b border-base-border">
                  <th className="py-3 pr-4 font-semibold">Campaign</th>
                  <th className="py-3 pr-4 font-semibold">Objective</th>
                  <th className="py-3 pr-4 font-semibold">Audience</th>
                  <th className="py-3 pr-4 font-semibold">Platforms</th>
                  <th className="py-3 pr-4 font-semibold">Spend</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {campaignsQuery.isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 pr-4"><div className="h-4 w-24 bg-base-border rounded" /></td>
                      <td className="py-4 pr-4"><div className="h-4 w-20 bg-base-border rounded" /></td>
                      <td className="py-4 pr-4"><div className="h-4 w-28 bg-base-border rounded" /></td>
                      <td className="py-4 pr-4"><div className="h-4 w-24 bg-base-border rounded" /></td>
                      <td className="py-4 pr-4"><div className="h-4 w-20 bg-base-border rounded" /></td>
                      <td className="py-4 pr-4"><div className="h-4 w-16 bg-base-border rounded" /></td>
                      <td className="py-4 text-right"><div className="h-8 w-20 bg-base-border rounded" /></td>
                    </tr>
                  ))
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-text-muted">
                      No campaigns match your filters.
                    </td>
                  </tr>
                ) : (
                  pagedCampaigns.map((campaign) => {
                    const spendPct = campaign.budget > 0 ? Math.min(100, Math.round((campaign.spent / campaign.budget) * 100)) : 0;
                    return (
                      <tr key={campaign.id} className="border-b border-base-border last:border-b-0 hover:bg-base-surface/50 transition-colors">
                        <td className="py-4 pr-4 align-top">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(campaign.id)}
                            onChange={() => toggleSelectRow(campaign.id)}
                            className="mt-1 h-4 w-4 rounded border-base-border bg-base text-accent-indigo focus:ring-accent-indigo"
                          />
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <div className="font-semibold text-white">{campaign.name}</div>
                          <div className="text-[11px] text-text-muted mt-1">{formatDateRange(campaign.start_date, campaign.end_date)}</div>
                        </td>
                        <td className="py-4 pr-4 align-top text-[13px] text-text-muted">{OBJECTIVES[campaign.objective]}</td>
                        <td className="py-4 pr-4 align-top text-[13px] text-text-muted">{campaign.target_audience}</td>
                        <td className="py-4 pr-4 align-top text-[13px] text-text-muted">{campaign.platforms.map(platformLabel).join(', ')}</td>
                        <td className="py-4 pr-4 align-top text-[13px] text-text-muted">
                          <div className="text-white font-semibold">{formatCurrency(campaign.spent)}</div>
                          <div className="h-1.5 mt-2 rounded-full bg-base-border overflow-hidden">
                            <div className="h-full bg-accent-indigo transition-all" style={{ width: `${spendPct}%` }} />
                          </div>
                        </td>
                        <td className="py-4 pr-4 align-top">
                          <CampaignStatusBadge status={campaign.status} />
                        </td>
                        <td className="py-4 align-top text-right">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-base-border px-3 py-2 text-xs text-text-muted hover:text-white hover:border-accent-indigo hover:bg-base-surface transition-all"
                          >
                            Details <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-text-muted">
              Showing {pagedCampaigns.length} of {filteredCampaigns.length} campaign(s)
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-base-border bg-base px-3 py-2 text-[12px] text-text-muted">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-full px-2 py-1 hover:bg-base-surface disabled:opacity-50"
              >
                Prev
              </button>
              <span>{currentPage} / {pageCount}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(pageCount, prev + 1))}
                disabled={currentPage === pageCount}
                className="rounded-full px-2 py-1 hover:bg-base-surface disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <CardTitle>Campaign insights</CardTitle>
          {selected ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-base-surface p-4 border border-base-border">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider">Selected campaign</p>
                    <h2 className="text-lg font-semibold text-white mt-2">{selected.name}</h2>
                  </div>
                  <Badge variant={STATUS_BADGE_VARIANTS[selected.status]}>{selected.status}</Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">Objective</p>
                    <p className="text-sm text-white mt-1">{OBJECTIVES[selected.objective]}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">AI score</p>
                    <p className="text-sm text-white mt-1">{selected.ai_score ?? 0}/100</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-base-surface rounded-2xl border border-base-border p-4">
                <p className="text-xs text-text-muted uppercase tracking-wider">Budget & reach</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-base py-3 px-4">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">Budget</p>
                    <p className="text-white font-semibold mt-1">{formatCurrency(selected.budget)}</p>
                  </div>
                  <div className="rounded-xl bg-base py-3 px-4">
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">Spend</p>
                    <p className="text-white font-semibold mt-1">{formatCurrency(selected.spent)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-base-surface rounded-2xl border border-base-border p-4">
                <p className="text-xs text-text-muted uppercase tracking-wider">Performance</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">CTR</p>
                    <p className="text-white font-semibold mt-1">{formatPercent(selected.metrics.ctr)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">ROAS</p>
                    <p className="text-white font-semibold mt-1">{formatNumber(selected.metrics.roas)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-text-muted uppercase tracking-wider">Clicks</p>
                    <p className="text-white font-semibold mt-1">{formatNumber(selected.metrics.clicks)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-base-surface rounded-2xl border border-base-border p-4">
                <p className="text-xs text-text-muted uppercase tracking-wider">Content schedule</p>
                <p className="text-sm text-white leading-relaxed">{selected.content_schedule ?? 'AI-generated content plan to be published across channels.'}</p>
              </div>

              <div className="space-y-2 bg-base-surface rounded-2xl border border-base-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-text-muted uppercase tracking-wider">Recent activity</p>
                  <span className="text-[11px] text-text-muted">{selected.timeline?.length ?? 0} events</span>
                </div>
                <div className="space-y-3">
                  {(selected.timeline ?? []).slice(0, 3).map((event) => (
                    <div key={`${selected.id}-${event.date}-${event.activity}`} className="rounded-xl bg-base p-3 border border-base-border">
                      <p className="text-[11px] text-text-muted">{formatDate(event.date, 'short')} · {platformLabel(event.platform)}</p>
                      <p className="text-sm text-white mt-1">{event.activity}</p>
                    </div>
                  ))}
                  {selected.timeline?.length === 0 && (
                    <p className="text-[12px] text-text-muted">No recent timeline data available.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-sm text-text-muted">
              Select a campaign to see insights and timeline details.
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-text-muted">
            <span className="rounded-full border border-base-border px-3 py-1">Last updated just now</span>
            <span className="rounded-full border border-base-border px-3 py-1">AI strategy recommendations included</span>
          </div>
        </Card>
      </motion.div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create new campaign" size="lg">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Campaign name"
              value={createForm.name}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <Select
              label="Objective"
              value={createForm.objective}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, objective: event.target.value }))}
              options={Object.entries(OBJECTIVES).map(([value, label]) => ({ value, label }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Target audience"
              value={createForm.target_audience}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, target_audience: event.target.value }))}
            />
            <Select
              label="Primary platform"
              value={createForm.platforms}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, platforms: event.target.value }))}
              options={PLATFORM_OPTIONS}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Budget"
              type="number"
              value={createForm.budget}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, budget: Number(event.target.value) }))}
            />
            <Input
              label="Start date"
              type="date"
              value={createForm.start_date}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, start_date: event.target.value }))}
            />
            <Input
              label="End date"
              type="date"
              value={createForm.end_date}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, end_date: event.target.value }))}
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-base-border">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button loading={createMutation.isPending} onClick={handleCreateSubmit}>Save campaign</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}

export default CampaignPage;
