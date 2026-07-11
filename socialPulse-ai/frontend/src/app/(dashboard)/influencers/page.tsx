'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, RefreshCw, ChevronRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { influencersApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockInfluencerProfiles } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatNumber, platformLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { InfluencerStatusBadge } from '@/components/influencers/InfluencerStatusBadge';
import type { InfluencerProfile, Platform } from '@/types';

const PLATFORM_FILTERS = [
  { value: 'all', label: 'All platforms' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
] as const;

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'invited', label: 'Invited' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'declined', label: 'Declined' },
] as const;

const SORT_OPTIONS = [
  { value: 'followers', label: 'Followers' },
  { value: 'engagement_rate', label: 'Engagement' },
  { value: 'avg_views', label: 'Average views' },
  { value: 'audience_match', label: 'Audience match' },
  { value: 'name', label: 'Name' },
] as const;

const PAGE_SIZE = 8;

interface InfluencerFormValues {
  name: string;
  handle: string;
  platform: Platform;
  niche: string;
  followers: number;
  engagement_rate: number;
  avg_views: number;
  audience_match: number;
}

const FORM_TEMPLATE: InfluencerFormValues = {
  name: '',
  handle: '',
  platform: 'instagram',
  niche: 'AI & Data Science',
  followers: 0,
  engagement_rate: 0,
  avg_views: 0,
  audience_match: 0,
};

export default function InfluencersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<typeof PLATFORM_FILTERS[number]['value']>('all');
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_FILTERS[number]['value']>('all');
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]['value']>('followers');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [formValues, setFormValues] = useState<InfluencerFormValues>(FORM_TEMPLATE);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [addedInfluencers, setAddedInfluencers] = useState<InfluencerProfile[]>([]);

  const queryClient = useQueryClient();

  const influencersQuery = useQuery<InfluencerProfile[]>({
    queryKey: QUERY_KEYS.influencers(),
    queryFn: () => influencersApi.list(),
    placeholderData: mockInfluencerProfiles,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (body: Omit<InfluencerProfile, 'id'>) => influencersApi.add(body),
    onSuccess: (newInfluencer) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.influencers() });
      setAddedInfluencers((prev) => [newInfluencer as InfluencerProfile, ...prev]);
      toast.success('Influencer added successfully.');
      setFormValues(FORM_TEMPLATE);
      setAddOpen(false);
    },
    onError: () => {
      toast.error('Unable to add influencer. Try again later.');
    },
  });

  const influencers = useMemo(() => {
    const base = influencersQuery.data ?? mockInfluencerProfiles;
    const merged = [...addedInfluencers, ...base];
    return merged.filter((item, idx) => merged.findIndex((entry) => entry.id === item.id) === idx);
  }, [influencersQuery.data, addedInfluencers]);

  const visibleInfluencers = useMemo(
    () => influencers.filter((influencer) => !deletedIds.includes(influencer.id)),
    [influencers, deletedIds],
  );

  const filteredInfluencers = useMemo(() => {
    return visibleInfluencers.filter((influencer) => {
      const matchesPlatform = platformFilter === 'all' || influencer.platform === platformFilter;
      const matchesStatus = statusFilter === 'all' || influencer.collaboration_status === statusFilter;
      const matchesSearch = [influencer.name, influencer.handle, influencer.niche, platformLabel(influencer.platform)]
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesPlatform && matchesStatus && matchesSearch;
    });
  }, [visibleInfluencers, platformFilter, statusFilter, searchQuery]);

  const sortedInfluencers = useMemo(() => {
    const sorted = [...filteredInfluencers];
    sorted.sort((a, b) => {
      const aValue = a[sortBy] ?? 0;
      const bValue = b[sortBy] ?? 0;

      if (sortBy === 'name') {
        return sortDirection === 'asc'
          ? String(a.name).localeCompare(String(b.name))
          : String(b.name).localeCompare(String(a.name));
      }

      return sortDirection === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });
    return sorted;
  }, [filteredInfluencers, sortBy, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sortedInfluencers.length / PAGE_SIZE));
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pagedInfluencers = sortedInfluencers.slice(pageStart, pageStart + PAGE_SIZE);

  const stats = useMemo(() => {
    const total = visibleInfluencers.length;
    const activeCollaborations = visibleInfluencers.filter((item) => item.collaboration_status === 'active').length;
    const avgEngagement = total
      ? visibleInfluencers.reduce((sum, item) => sum + item.engagement_rate, 0) / total
      : 0;
    const totalReach = visibleInfluencers.reduce((sum, item) => sum + item.followers, 0);

    return [
      { label: 'Total influencers', value: total, tone: 'text-accent-indigo' },
      { label: 'Active collaborations', value: activeCollaborations, tone: 'text-accent-green' },
      { label: 'Avg engagement', value: `${avgEngagement.toFixed(1)}%`, tone: 'text-accent-purple' },
      { label: 'Total reach', value: formatNumber(totalReach, false), tone: 'text-accent-sky' },
    ];
  }, [visibleInfluencers]);

  const handleCreateSubmit = () => {
    if (!formValues.name.trim() || !formValues.handle.trim()) {
      toast.error('Please enter a name and handle.');
      return;
    }

    const newInfluencer: Omit<InfluencerProfile, 'id'> = {
      ...formValues,
      bio: 'Trusted influencer with strong audience resonance across business and tech audiences.',
      avg_likes: 0,
      avg_comments: 0,
      authenticity: 85,
      ai_collaboration_score: 75,
      audience_match: 78,
      collaboration_status: 'invited',
      social_accounts: [
        { platform: formValues.platform, handle: formValues.handle, url: `https://www.${formValues.platform}.com/${formValues.handle.replace('@', '')}` },
      ],
      audience_demographics: [
        { label: 'Tech professionals', share: 42 },
        { label: 'Startup founders', share: 26 },
        { label: 'AI enthusiasts', share: 18 },
        { label: 'Creative teams', share: 14 },
      ],
      collaboration_history: [],
      campaigns: [],
      notes: 'New invite sent. Follow up with onboarding kit.',
      contact: {
        email: 'hello@example.com',
        phone: '+1 555 012 3456',
        manager: 'Taylor Reed',
      },
      platform_distribution: [
        { platform: formValues.platform, value: 100 },
      ],
      followers_growth: [
        { date: 'W1', value: 0 },
        { date: 'W2', value: 0 },
        { date: 'W3', value: 0 },
      ],
      engagement_trend: [
        { date: 'W1', value: 0 },
        { date: 'W2', value: 0 },
        { date: 'W3', value: 0 },
      ],
      reach_series: [
        { date: 'W1', value: 0 },
        { date: 'W2', value: 0 },
        { date: 'W3', value: 0 },
      ],
    };

    createMutation.mutate(newInfluencer);
  };

  const handleDelete = (id: string) => {
    setDeletedIds((prev) => [...prev, id]);
    toast.success('Influencer removed from the list.');
  };

  const handlePageChange = (next: number) => {
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (influencersQuery.isError) {
    return (
      <div className="space-y-4 py-20 text-center">
        <p className="text-sm text-text-muted">Unable to load influencers.</p>
        <Button onClick={() => influencersQuery.refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Influencers</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Influencer Management</h1>
            <p className="text-xs text-text-muted max-w-xl">Manage influencer partnerships, collaboration status, and campaign performance at a glance.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => influencersQuery.refetch()}
            className="flex items-center gap-2 text-xs text-text-muted hover:text-white border border-base-border hover:border-brand-indigo/40 rounded-lg px-3 py-2 transition-all disabled:opacity-50"
            disabled={influencersQuery.isFetching}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${influencersQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAddOpen(true)}>
            Add influencer
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">{item.label}</p>
            <div className="flex items-center justify-between gap-3">
              <p className={`text-3xl font-black ${item.tone}`}>{item.value}</p>
              <span className="text-xs text-text-muted">Live</span>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <Card className="p-4">
          <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search influencers..."
                className="bg-base-surface border border-base-border"
                aria-label="Search influencers"
              />
              <Select
                value={platformFilter}
                onChange={(event) => setPlatformFilter(event.target.value as typeof platformFilter)}
                className="bg-base-surface border border-base-border"
                aria-label="Filter by platform"
              >
                {PLATFORM_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="bg-base-surface border border-base-border"
                aria-label="Filter by collaboration status"
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_0.65fr]">
              <Select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                className="bg-base-surface border border-base-border"
                aria-label="Sort influencers"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <Select
                value={sortDirection}
                onChange={(event) => setSortDirection(event.target.value as 'asc' | 'desc')}
                className="bg-base-surface border border-base-border"
                aria-label="Sort direction"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-text-muted">
            <p>Monitor active collaborations, invite new partners, and keep campaign-ready influencers within reach.</p>
            <p>Use filters to find platform-specific talent and sort by engagement, reach, or audience fit.</p>
          </CardBody>
        </Card>
      </motion.div>

      {pagedInfluencers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-text-muted">No influencers match your filters.</p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>Invite a new influencer</Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="grid grid-cols-[48px_2.2fr_1fr_1fr_1fr_1fr_1fr] gap-0 bg-base-sunken px-4 py-3 text-[11px] uppercase tracking-widest text-text-muted">
            <div className="flex items-center justify-center"><input type="checkbox" disabled className="cursor-not-allowed" /></div>
            <span>Name</span>
            <span>Platform</span>
            <span>Category</span>
            <span>Followers</span>
            <span>Engagement</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-base-border bg-base-surface">
            {pagedInfluencers.map((influencer) => (
              <div key={influencer.id} className="grid grid-cols-[48px_2.2fr_1fr_1fr_1fr_1fr_1fr] items-center gap-0 px-4 py-4 hover:bg-base-sunken transition-colors">
                <div className="flex items-center justify-center">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-base-border text-[10px] font-semibold text-white">
                    {influencer.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <Link href={`/influencers/${influencer.id}`} className="text-sm font-semibold text-white hover:text-accent-indigo">
                    {influencer.name}
                  </Link>
                  <p className="text-[11px] text-text-muted">{influencer.handle}</p>
                </div>
                <div>
                  <Badge size="sm" variant={influencer.platform === 'instagram' ? 'pink' : influencer.platform === 'twitter' ? 'sky' : influencer.platform === 'linkedin' ? 'indigo' : 'green'}>
                    {platformLabel(influencer.platform)}
                  </Badge>
                </div>
                <div className="text-sm text-text-muted">{influencer.niche}</div>
                <div className="font-semibold text-white">{formatNumber(influencer.followers, false)}</div>
                <div className="text-sm text-text-muted">{influencer.engagement_rate.toFixed(1)}%</div>
                <div className="flex justify-end gap-2 items-center">
                  <InfluencerStatusBadge status={influencer.collaboration_status} />
                  <button type="button" onClick={() => handleDelete(influencer.id)} className="text-text-muted hover:text-red-400" aria-label={`Delete ${influencer.name}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-muted">Showing {pagedInfluencers.length} of {filteredInfluencers.length} influencers</p>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={currentPage <= 1} onClick={() => handlePageChange(currentPage - 1)}>
            Previous
          </Button>
          <span className="text-xs text-text-muted">Page {currentPage} of {pageCount}</span>
          <Button variant="ghost" size="sm" disabled={currentPage >= pageCount} onClick={() => handlePageChange(currentPage + 1)}>
            Next
          </Button>
        </div>
      </motion.div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Invite influencer" size="lg">
        <div className="space-y-4 p-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Name</label>
              <Input
                value={formValues.name}
                onChange={(event) => setFormValues({ ...formValues, name: event.target.value })}
                placeholder="e.g. Alex Rivera"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Handle</label>
              <Input
                value={formValues.handle}
                onChange={(event) => setFormValues({ ...formValues, handle: event.target.value })}
                placeholder="e.g. @alexrivera_ai"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Platform</label>
              <Select
                value={formValues.platform}
                onChange={(event) => setFormValues({ ...formValues, platform: event.target.value as Platform })}
              >
                <option value="instagram">Instagram</option>
                <option value="twitter">X / Twitter</option>
                <option value="linkedin">LinkedIn</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Category</label>
              <Input
                value={formValues.niche}
                onChange={(event) => setFormValues({ ...formValues, niche: event.target.value })}
                placeholder="e.g. AI & Data Science"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Engagement rate</label>
              <Input
                type="number"
                value={formValues.engagement_rate}
                onChange={(event) => setFormValues({ ...formValues, engagement_rate: Number(event.target.value) })}
                placeholder="e.g. 8.4"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Followers</label>
              <Input
                type="number"
                value={formValues.followers}
                onChange={(event) => setFormValues({ ...formValues, followers: Number(event.target.value) })}
                placeholder="e.g. 120000"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Avg views</label>
              <Input
                type="number"
                value={formValues.avg_views}
                onChange={(event) => setFormValues({ ...formValues, avg_views: Number(event.target.value) })}
                placeholder="e.g. 85000"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Audience match</label>
              <Input
                type="number"
                value={formValues.audience_match}
                onChange={(event) => setFormValues({ ...formValues, audience_match: Number(event.target.value) })}
                placeholder="e.g. 88"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSubmit} loading={createMutation.isPending}>Send invite</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
