'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Edit3, Download, Mail, Phone, Globe, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { influencersApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockInfluencerProfiles, mockInfluencerRecommendations } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatNumber, formatPercent, platformLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { InfluencerStatusBadge } from '@/components/influencers/InfluencerStatusBadge';
import { InfluencerAnalyticsCharts } from '@/components/influencers/InfluencerAnalyticsCharts';
import type { InfluencerProfile, InfluencerRecommendation, InfluencerStatus } from '@/types';

const STATUS_ACTIONS: Record<InfluencerStatus, { label: string; next: InfluencerStatus }[]> = {
  invited: [{ label: 'Accept invitation', next: 'active' }, { label: 'Decline', next: 'declined' }],
  negotiating: [{ label: 'Mark active', next: 'active' }, { label: 'Decline', next: 'declined' }],
  active: [{ label: 'Complete collaboration', next: 'completed' }],
  completed: [],
  declined: [{ label: 'Re-invite', next: 'invited' }],
};

const EDIT_TEMPLATE = {
  name: '',
  handle: '',
  niche: '',
  location: '',
  email: '',
  phone: '',
  manager: '',
  notes: '',
};

export default function InfluencerDetailPage() {
  const params = useParams();
  const influencerId = params?.id as string;
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<typeof EDIT_TEMPLATE>(EDIT_TEMPLATE);

  const influencersQuery = useQuery<InfluencerProfile[]>({
    queryKey: QUERY_KEYS.influencers(),
    queryFn: () => influencersApi.list(),
    placeholderData: mockInfluencerProfiles,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const influencer = useMemo<InfluencerProfile | undefined>(() => {
    return influencersQuery.data?.find((item) => item.id === influencerId)
      ?? mockInfluencerProfiles.find((item) => item.id === influencerId);
  }, [influencersQuery.data, influencerId]);

  const updateMutation = useMutation({
    mutationFn: (body: Partial<InfluencerProfile>) => influencersApi.update(influencerId, body),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.influencers() });
      queryClient.setQueryData<InfluencerProfile[]>(QUERY_KEYS.influencers(), (old) =>
        old?.map((item) => (item.id === influencerId ? { ...item, ...(updated as Partial<InfluencerProfile>) } : item)) ?? [],
      );
      toast.success('Influencer profile updated.');
      setEditOpen(false);
    },
    onError: () => {
      toast.error('Unable to update the profile.');
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: InfluencerStatus) => influencersApi.update(influencerId, { collaboration_status: status }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.influencers() });
      queryClient.setQueryData<InfluencerProfile[]>(QUERY_KEYS.influencers(), (old) =>
        old?.map((item) => (item.id === influencerId ? { ...item, ...(updated as Partial<InfluencerProfile>) } : item)) ?? [],
      );
      toast.success('Collaboration status updated.');
    },
    onError: () => {
      toast.error('Unable to update status.');
    },
  });

  const recommendations = useMemo<InfluencerRecommendation[]>(
    () => mockInfluencerRecommendations.filter((item) => item.title && item.title.length > 0),
    [],
  );

  if (!influencer && !influencersQuery.isLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-text-muted">Influencer not found.</p>
        <Link href="/influencers" className="mt-4 inline-flex items-center justify-center rounded-lg border border-base-border px-4 py-2 text-sm text-white hover:border-accent-indigo hover:text-accent-indigo">
          Back to influencers
        </Link>
      </div>
    );
  }

  const openEditModal = () => {
    if (!influencer) return;
    setEditForm({
      name: influencer.name,
      handle: influencer.handle,
      niche: influencer.niche,
      location: influencer.location ?? '',
      email: influencer.contact?.email ?? '',
      phone: influencer.contact?.phone ?? '',
      manager: influencer.contact?.manager ?? '',
      notes: influencer.notes ?? '',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = () => {
    if (!influencer) return;
    updateMutation.mutate({
      name: editForm.name,
      handle: editForm.handle,
      niche: editForm.niche,
      location: editForm.location,
      contact: { email: editForm.email, phone: editForm.phone, manager: editForm.manager },
      notes: editForm.notes,
    });
  };

  const handleStatusAction = (nextStatus: InfluencerStatus) => {
    statusMutation.mutate(nextStatus);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/influencers" className="hover:text-white">Influencers</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{influencer?.name ?? 'Profile'}</span>
          </div>
          <div className="mt-3">
            <h1 className="text-lg font-extrabold text-white tracking-tight">{influencer?.name ?? 'Influencer Profile'}</h1>
            <p className="text-xs text-text-muted max-w-2xl">Deep insight into collaboration history, audience composition, and campaign performance.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast('Exporting influencer profile...')}>
            Export
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-4 h-4" />} onClick={openEditModal}>
            Edit profile
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.95fr]">
        <div className="space-y-6">
          <Card className="p-4">
            <CardHeader>
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted">Profile information</p>
                <h2 className="text-xl font-semibold text-white mt-2">{influencer?.handle}</h2>
              </div>
              <InfluencerStatusBadge status={influencer?.collaboration_status ?? 'invited'} />
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-3xl border border-base-border bg-base-surface p-4">
                  <p className="text-[11px] uppercase tracking-widest text-text-muted">Bio</p>
                  <p className="text-sm text-text-secondary">{influencer?.bio}</p>
                </div>
                <div className="space-y-3 rounded-3xl border border-base-border bg-base-surface p-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-text-muted">Primary platform</p>
                    <p className="text-sm text-white mt-2">{platformLabel(influencer?.platform ?? 'instagram')}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-text-muted">Category</p>
                    <p className="text-sm text-white mt-2">{influencer?.niche}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                  <p className="text-[11px] uppercase tracking-widest text-text-muted">Followers</p>
                  <p className="text-3xl font-black text-white mt-3">{formatNumber(influencer?.followers ?? 0, false)}</p>
                </div>
                <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                  <p className="text-[11px] uppercase tracking-widest text-text-muted">Engagement</p>
                  <p className="text-3xl font-black text-accent-purple mt-3">{formatPercent(influencer?.engagement_rate ?? 0)}</p>
                </div>
                <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                  <p className="text-[11px] uppercase tracking-widest text-text-muted">Avg views</p>
                  <p className="text-3xl font-black text-accent-indigo mt-3">{formatNumber(influencer?.avg_views ?? 0, false)}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                  <p className="text-[11px] uppercase tracking-widest text-text-muted">Audience match</p>
                  <p className="text-2xl font-black text-accent-green mt-3">{influencer?.audience_match ?? 0}%</p>
                </div>
                <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                  <p className="text-[11px] uppercase tracking-widest text-text-muted">Authenticity</p>
                  <p className="text-2xl font-black text-accent-sky mt-3">{influencer?.authenticity ?? 0}%</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Social accounts</CardTitle>
            </CardHeader>
            <CardBody className="grid gap-3">
              {influencer?.social_accounts?.map((account) => (
                <a key={`${account.platform}-${account.handle}`} href={account.url} target="_blank" rel="noreferrer" className="rounded-3xl border border-base-border bg-base-surface p-4 text-sm text-white hover:border-accent-indigo transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{platformLabel(account.platform)}</p>
                      <p className="text-xs text-text-muted mt-1">{account.handle}</p>
                    </div>
                    <Globe className="w-4 h-4 text-text-muted" />
                  </div>
                </a>
              ))}
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Audience demographics</CardTitle>
            </CardHeader>
            <CardBody className="grid gap-3">
              {influencer?.audience_demographics.map((item) => (
                <div key={item.label} className="rounded-3xl border border-base-border bg-base-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-white">{item.label}</p>
                    <p className="text-sm font-semibold text-accent-indigo">{item.share}%</p>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-base-border overflow-hidden">
                    <div className="h-full bg-accent-indigo" style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Collaboration history</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {influencer?.collaboration_history.map((entry) => (
                <div key={entry.id} className="rounded-3xl border border-base-border bg-base-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.title}</p>
                      <p className="text-[11px] text-text-muted mt-1">{entry.date}</p>
                    </div>
                    <Badge size="sm" variant={entry.status === 'completed' ? 'green' : entry.status === 'active' ? 'sky' : 'orange'}>{entry.status}</Badge>
                  </div>
                  <p className="text-sm text-text-muted mt-3">{entry.description}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>AI recommendation panel</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {recommendations.map((item) => (
                <div key={item.title} className="rounded-3xl border border-base-border bg-base-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white">{item.title}</p>
                    <Badge size="sm" variant={item.priority === 'high' ? 'pink' : item.priority === 'medium' ? 'orange' : 'green'}>
                      {item.priority}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-text-muted">{item.description}</p>
                  <p className="text-[11px] text-text-muted mt-3">Impact: {item.potential_impact}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Contact information</CardTitle>
            </CardHeader>
            <CardBody className="grid gap-3">
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <p className="text-[11px] uppercase tracking-widest text-text-muted">Manager</p>
                <p className="text-sm text-white mt-2">{influencer?.contact.manager}</p>
              </div>
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-text-muted" />
                  <p className="text-sm text-white">{influencer?.contact.email}</p>
                </div>
              </div>
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <p className="text-sm text-white">{influencer?.contact.phone}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Collaboration status</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-text-muted">Current status is {influencer?.collaboration_status}. Use the controls below to advance the relationship.</p>
              <div className="flex flex-wrap gap-2">
                {(STATUS_ACTIONS[influencer?.collaboration_status ?? 'invited'] || []).map((action) => (
                  <Button key={action.next} variant="ghost" size="sm" onClick={() => handleStatusAction(action.next)}>
                    {action.label}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={openEditModal} leftIcon={<Edit3 className="w-4 h-4" />}>Update details</Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card className="p-4">
        <CardHeader>
          <CardTitle>Engagement analytics</CardTitle>
        </CardHeader>
        <CardBody>
          <InfluencerAnalyticsCharts
            growthData={influencer?.followers_growth ?? []}
            engagementData={influencer?.engagement_trend ?? []}
            demographics={influencer?.audience_demographics ?? []}
            platformDistribution={influencer?.platform_distribution ?? []}
            loading={influencersQuery.isLoading}
          />
        </CardBody>
      </Card>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit influencer profile" size="lg">
        <div className="space-y-4 p-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Name</label>
              <Input value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Handle</label>
              <Input value={editForm.handle} onChange={(event) => setEditForm({ ...editForm, handle: event.target.value })} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Category</label>
              <Input value={editForm.niche} onChange={(event) => setEditForm({ ...editForm, niche: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Location</label>
              <Input value={editForm.location} onChange={(event) => setEditForm({ ...editForm, location: event.target.value })} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Email</label>
              <Input value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Phone</label>
              <Input value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-text-muted">Manager</label>
              <Input value={editForm.manager} onChange={(event) => setEditForm({ ...editForm, manager: event.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-text-muted">Notes</label>
            <textarea
              value={editForm.notes}
              onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })}
              className="w-full rounded-2xl border border-base-border bg-base-surface p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} loading={updateMutation.isPending}>Save changes</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
