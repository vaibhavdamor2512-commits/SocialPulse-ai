'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, Search, Trash2, Download, ArrowRight, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { competitorsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockCompetitors } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatNumber, platformLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Competitor } from '@/types';

const PLATFORM_OPTIONS = [
  { value: 'all', label: 'All platforms' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'facebook', label: 'Facebook' },
] as const;

const PLATFORM_BADGES: Record<string, 'green' | 'orange' | 'sky' | 'pink'> = {
  instagram: 'pink',
  twitter: 'sky',
  linkedin: 'indigo',
  facebook: 'green',
};

const FORM_TEMPLATE = {
  name: '',
  handle: '',
  platform: 'instagram',
};

export default function CompetitorsPage() {
  const [platformFilter, setPlatformFilter] = useState<typeof PLATFORM_OPTIONS[number]['value']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [formValues, setFormValues] = useState<typeof FORM_TEMPLATE>(FORM_TEMPLATE);

  const queryClient = useQueryClient();

  const competitorsQuery = useQuery({
    queryKey: QUERY_KEYS.competitors,
    queryFn: competitorsApi.list,
    placeholderData: mockCompetitors,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const addMutation = useMutation({
    mutationFn: (body: typeof FORM_TEMPLATE) => competitorsApi.add(body),
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEYS.competitors);
      toast.success('Competitor added to watchlist');
      setAddOpen(false);
      setFormValues(FORM_TEMPLATE);
    },
    onError: () => {
      toast.error('Unable to add competitor. Try again later.');
    },
  });

  const competitors = competitorsQuery.data ?? mockCompetitors;
  const visibleCompetitors = useMemo(
    () => competitors.filter((competitor) => !deletedIds.includes(competitor.id)),
    [competitors, deletedIds],
  );

  const filteredCompetitors = useMemo(
    () => visibleCompetitors.filter((competitor) => {
      const matchesPlatform = platformFilter === 'all' || competitor.platform === platformFilter;
      const matchesSearch = [competitor.name, competitor.handle, platformLabel(competitor.platform)]
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesSearch;
    }),
    [visibleCompetitors, platformFilter, searchQuery],
  );

  const statCards = useMemo(() => {
    const total = visibleCompetitors.length;
    const avgEngagement = total ? visibleCompetitors.reduce((sum, item) => sum + item.engagement, 0) / total : 0;
    const avgSentiment = total ? visibleCompetitors.reduce((sum, item) => sum + item.sentiment, 0) / total : 0;
    const avgGrowth = total ? visibleCompetitors.reduce((sum, item) => sum + item.growth_rate, 0) / total : 0;

    return [
      { label: 'Competitors tracked', value: total, tone: 'text-accent-indigo' },
      { label: 'Avg growth', value: `${avgGrowth.toFixed(1)}%`, tone: 'text-accent-green' },
      { label: 'Avg engagement', value: `${avgEngagement.toFixed(1)}%`, tone: 'text-accent-purple' },
      { label: 'Avg sentiment', value: `${avgSentiment.toFixed(0)}%`, tone: 'text-accent-sky' },
    ];
  }, [visibleCompetitors]);

  const pageCompetitors = filteredCompetitors.slice(0, 12);
  const allSelected = pageCompetitors.length > 0 && pageCompetitors.every((comp) => selectedIds.includes(comp.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(pageCompetitors.map((comp) => comp.id));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedIds.length) {
      toast('Select at least one competitor.');
      return;
    }
    setDeletedIds((prev) => Array.from(new Set([...prev, ...selectedIds])));
    setSelectedIds([]);
    toast.success(`${selectedIds.length} competitor(s) removed from view`);
  };

  const handleExportSelected = () => {
    const selected = visibleCompetitors.filter((competitor) => selectedIds.includes(competitor.id));
    if (!selected.length) {
      toast('Select at least one competitor to export.');
      return;
    }

    const rows = [
      ['Name', 'Handle', 'Platform', 'Followers', 'Engagement', 'Sentiment', 'Growth', 'Posts / wk', 'Top hashtags'],
      ...selected.map((competitor) => [
        competitor.name,
        competitor.handle,
        platformLabel(competitor.platform),
        formatNumber(competitor.followers, false),
        `${competitor.engagement.toFixed(1)}%`,
        `${competitor.sentiment}%`,
        `${competitor.growth_rate.toFixed(1)}%`,
        competitor.posts_per_week.toString(),
        competitor.top_hashtags.join(' '),
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'competitors-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddSubmit = () => {
    if (!formValues.name.trim() || !formValues.handle.trim()) {
      toast.error('Please enter a competitor name and handle.');
      return;
    }

    addMutation.mutate({
      name: formValues.name.trim(),
      handle: formValues.handle.trim(),
      platform: formValues.platform,
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
            <Target className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Competitor Analysis</h1>
            <p className="text-xs text-text-muted max-w-xl">
              Monitor competitor performance, sentiment, and posting cadence across key platforms.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            onClick={() => competitorsQuery.refetch()}
            disabled={competitorsQuery.isFetching}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-white border border-base-border hover:border-brand-indigo/40 rounded-lg px-3 py-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${competitorsQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
            Add competitor
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">{card.label}</p>
            <div className="flex items-center justify-between gap-3">
              <p className={`text-3xl font-black ${card.tone}`}>{card.value}</p>
              <span className="text-text-muted text-sm">Live</span>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-4">
          <CardHeader>
            <div>
              <CardTitle>Watchlist</CardTitle>
              <p className="text-xs text-text-muted">Filter, review, and act on your competitor set.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDeleteSelected} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                Remove selected
              </Button>
              <Button variant="ghost" size="sm" onClick={handleExportSelected} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Export
              </Button>
            </div>
          </CardHeader>

          <div className="grid gap-3 md:grid-cols-3">
            <Select
              value={platformFilter}
              onChange={(event) => setPlatformFilter(event.target.value as typeof platformFilter)}
              className="bg-base-surface border border-base-border"
            >
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search competitors..."
              className="bg-base-surface border border-base-border"
            />
            <div className="hidden md:block" />
          </div>

          <div className="mt-4 overflow-hidden rounded-3xl border border-base-border">
            <div className="grid grid-cols-[48px_1.5fr_1fr_1fr_1fr_88px] gap-0 bg-base-sunken px-4 py-3 text-[11px] uppercase tracking-widest text-text-muted">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="flex items-center justify-center"
              >
                <input type="checkbox" checked={allSelected} readOnly className="cursor-pointer" />
              </button>
              <span>Name</span>
              <span>Followers</span>
              <span>Engagement</span>
              <span>Sentiment</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-base-border bg-base-surface">
              {filteredCompetitors.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-text-muted">
                  No competitors match your filters.
                </div>
              ) : (
                filteredCompetitors.map((competitor) => {
                  const isSelected = selectedIds.includes(competitor.id);
                  return (
                    <div key={competitor.id} className="grid grid-cols-[48px_1.5fr_1fr_1fr_1fr_88px] items-center gap-0 px-4 py-3 hover:bg-base-sunken transition-colors">
                      <button
                        type="button"
                        onClick={() => toggleSelectRow(competitor.id)}
                        className="flex items-center justify-center"
                      >
                        <input type="checkbox" checked={isSelected} readOnly className="cursor-pointer" />
                      </button>
                      <div className="flex flex-col gap-1">
                        <Link href={`/competitors/${competitor.id}`} className="font-semibold text-sm text-white hover:text-accent-indigo">
                          {competitor.name}
                        </Link>
                        <p className="text-[11px] text-text-muted">{competitor.handle} · {platformLabel(competitor.platform)}</p>
                        <div className="flex flex-wrap gap-2">
                          {competitor.top_hashtags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-white">{formatNumber(competitor.followers, false)}</span>
                      <span className="text-sm text-text-muted">{competitor.engagement.toFixed(1)}%</span>
                      <span className="text-sm text-text-muted">{competitor.sentiment}%</span>
                      <div className="flex justify-end gap-2 items-center">
                        <Badge variant={PLATFORM_BADGES[competitor.platform] ?? 'green'} size="sm">
                          {platformLabel(competitor.platform)}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-3xl border border-base-border bg-base-surface p-4">
              <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Top performer</p>
              <p className="text-sm text-white">Pulse Media leads the pack with the strongest growth and highest engagement on Instagram.</p>
            </div>
            <div className="rounded-3xl border border-base-border bg-base-surface p-4">
              <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Watch trend</p>
              <p className="text-sm text-white">Focus on hashtags around product storytelling and AI use cases for immediate resonance.</p>
            </div>
            <div className="rounded-3xl border border-base-border bg-base-surface p-4">
              <p className="text-xs uppercase tracking-widest text-text-muted mb-2">Competitive signal</p>
              <p className="text-sm text-white">Increasing posting cadence often correlates with a 10–15% engagement lift across the top 4 competitors.</p>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add competitor" size="md">
        <div className="space-y-4 p-2">
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-text-muted">Name</label>
            <Input
              value={formValues.name}
              onChange={(event) => setFormValues({ ...formValues, name: event.target.value })}
              placeholder="e.g. TechVision Co"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-text-muted">Handle</label>
            <Input
              value={formValues.handle}
              onChange={(event) => setFormValues({ ...formValues, handle: event.target.value })}
              placeholder="e.g. @techvisionco"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-text-muted">Platform</label>
            <Select
              value={formValues.platform}
              onChange={(event) => setFormValues({ ...formValues, platform: event.target.value })}
            >
              {PLATFORM_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit} loading={addMutation.isLoading}>Add</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
