'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Mail,
  Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { authApi, notificationsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockNotifications } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import {
  capitalize,
  formatDate,
  formatRelativeTime,
  severityBg,
  severityColor,
  truncate,
} from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { Notification, NotificationPrefs, NotificationsResponse } from '@/types';

const PAGE_SIZE = 8;
const VIEW_FILTERS = ['all', 'unread', 'read'] as const;
const SEVERITY_FILTERS = ['all', 'info', 'warning', 'success', 'error'] as const;

const NOTIFICATION_PRESETS: Record<string, { label: string; variant: 'indigo' | 'orange' | 'green' | 'pink' | 'sky' }> = {
  all: { label: 'All', variant: 'default' },
  unread: { label: 'Unread', variant: 'indigo' },
  read: { label: 'Read', variant: 'sky' },
};

const PREF_LABELS: Record<keyof NotificationPrefs, string> = {
  email_alerts: 'Email alerts',
  viral_predictions: 'Viral prediction alerts',
  campaign_updates: 'Campaign updates',
  competitor_alerts: 'Competitor alerts',
  weekly_digest: 'Weekly digest',
};

const PREF_HINTS: Record<keyof NotificationPrefs, string> = {
  email_alerts: 'Receive email summaries and alerts.',
  viral_predictions: 'Get notified when content is likely to go viral.',
  campaign_updates: 'Stay informed about campaign performance changes.',
  competitor_alerts: 'Watch competitor activity and spikes.',
  weekly_digest: 'Receive a weekly notification summary.',
};

function getNotificationTypeLabel(type: string) {
  if (type.includes('viral')) return 'Viral prediction';
  if (type.includes('sentiment')) return 'Sentiment alert';
  if (type.includes('campaign')) return 'Campaign update';
  if (type.includes('competitor')) return 'Competitor alert';
  if (type.includes('milestone')) return 'Milestone';
  return capitalize(type.replace(/_/g, ' '));
}

function getSeverityBadgeVariant(severity: Notification['severity']) {
  switch (severity) {
    case 'success': return 'green';
    case 'warning': return 'orange';
    case 'error': return 'pink';
    default: return 'sky';
  }
}

function getChannelIcon(type: string) {
  if (type.includes('viral')) return <Activity className="w-4 h-4" />;
  if (type.includes('sentiment')) return <AlertTriangle className="w-4 h-4" />;
  if (type.includes('campaign')) return <ShieldCheck className="w-4 h-4" />;
  if (type.includes('competitor')) return <Bell className="w-4 h-4" />;
  return <Mail className="w-4 h-4" />;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { notifications, unreadCount, isLoading, markRead, markAllRead, deleteNotification } = useNotifications();
  const { user } = useAuth();
  const setUser = useStore((state) => state.setUser);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState<(typeof VIEW_FILTERS)[number]>('all');
  const [severityFilter, setSeverityFilter] = useState<(typeof SEVERITY_FILTERS)[number]>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    email_alerts: true,
    viral_predictions: true,
    campaign_updates: true,
    competitor_alerts: true,
    weekly_digest: true,
  });

  useEffect(() => {
    if (user?.notification_prefs) {
      setPrefs(user.notification_prefs);
    }
  }, [user?.notification_prefs]);

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((notification) => {
        if (viewFilter === 'unread') return !notification.read;
        if (viewFilter === 'read') return notification.read;
        return true;
      })
      .filter((notification) => {
        if (severityFilter === 'all') return true;
        return notification.severity === severityFilter;
      })
      .filter((notification) => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;
        return [notification.title, notification.body, notification.type]
          .join(' ')
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notifications, searchTerm, viewFilter, severityFilter]);

  useEffect(() => {
    if (!activeNotificationId && filteredNotifications.length > 0) {
      setActiveNotificationId(filteredNotifications[0].id);
    }
  }, [activeNotificationId, filteredNotifications]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filteredNotifications.some((notification) => notification.id === id)));
  }, [filteredNotifications]);

  const pageCount = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE));
  const visibleNotifications = filteredNotifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const allSelected = visibleNotifications.length > 0 && visibleNotifications.every((notification) => selectedIds.includes(notification.id));
  const activeNotification = filteredNotifications.find((notification) => notification.id === activeNotificationId) ?? filteredNotifications[0];
  const isAnySelected = selectedIds.length > 0;

  const updatePrefsMutation = useMutation({
    mutationFn: (body: Partial<NotificationPrefs>) => authApi.updateMe({ notification_prefs: body } as any),
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser);
      }
      toast.success('Notification preferences saved.');
    },
    onError: () => {
      toast.error('Unable to save notification preferences.');
    },
  });

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(visibleNotifications.map((notification) => notification.id));
  };

  const handleMarkSelectedRead = () => {
    selectedIds.forEach((id) => markRead(id));
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => deleteNotification(id));
    setSelectedIds([]);
  };

  const handleSimulateAlert = () => {
    const newNotification: Notification = {
      id: `notif_sim_${Date.now()}`,
      type: 'viral_prediction',
      title: 'Simulated Alert: Engagement spike detected',
      body: 'Your campaign is showing a sudden lift in engagement. Check the analytics dashboard for details.',
      severity: 'success',
      read: false,
      action_url: '/analytics',
      created_at: new Date().toISOString(),
    };

    queryClient.setQueryData<NotificationsResponse>(QUERY_KEYS.notifications(), (current) => {
      const next = current ?? {
        notifications: [],
        total: 0,
        unread_count: 0,
        page: { skip: 0, limit: 100 },
      };

      return {
        ...next,
        notifications: [newNotification, ...next.notifications],
        total: next.total + 1,
        unread_count: next.unread_count + 1,
      };
    });

    toast.success('New alert simulated.');
    setActiveNotificationId(newNotification.id);
  };

  const handleSavePreferences = () => {
    updatePrefsMutation.mutate(prefs);
  };

  const handleOpenNotification = (notification: Notification) => {
    if (!notification.read) {
      markRead(notification.id);
    }
    setActiveNotificationId(notification.id);
  };

  const hasUnread = notifications.some((notification) => !notification.read);
  const densityLabel = `${filteredNotifications.length} alert${filteredNotifications.length === 1 ? '' : 's'}`;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent-indigo font-semibold">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Notification center</h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Manage alerts, review recent activity, and fine-tune notification preferences in one place.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" variant="ghost" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notifications() })}>
            Refresh
          </Button>
          <Button size="sm" leftIcon={<Sparkles className="w-4 h-4" />} onClick={handleSimulateAlert}>
            Simulate alert
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <CardHeader>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted">Total alerts</p>
                  <p className="text-2xl font-semibold text-white">{notifications.length}</p>
                </div>
                <Badge variant="indigo" size="sm">Live</Badge>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-text-muted">All alerts pulled from your feed and system updates.</p>
              </CardBody>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted">Unread</p>
                  <p className="text-2xl font-semibold text-white">{unreadCount}</p>
                </div>
                <Badge variant="orange" size="sm">Attention</Badge>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-text-muted">Notifications waiting for review.</p>
              </CardBody>
            </Card>

            <Card className="p-4">
              <CardHeader>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-text-muted">Status</p>
                  <p className="text-2xl font-semibold text-white">{hasUnread ? 'Active' : 'Cleared'}</p>
                </div>
                <Badge variant={hasUnread ? 'green' : 'sky'} size="sm">{hasUnread ? 'New' : 'Idle'}</Badge>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-text-muted">Mark items read or simulate an alert to keep the feed moving.</p>
              </CardBody>
            </Card>
          </div>

          <Card className="p-4">
            <CardHeader>
              <div>
                <CardTitle>Filter alerts</CardTitle>
                <p className="text-xs text-text-muted">Search, filter severity, and view unread alerts.</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
                <Input
                  value={searchTerm}
                  onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }}
                  placeholder="Search by title, type, or content"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid grid-cols-3 gap-2">
                    {VIEW_FILTERS.map((option) => (
                      <button
                        key={option}
                        onClick={() => { setViewFilter(option); setCurrentPage(1); }}
                        className={
                          `rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                            viewFilter === option
                              ? 'bg-base-surface text-white border border-base-border'
                              : 'bg-base-sunken text-text-muted hover:bg-base-surface'
                          }`
                        }
                      >
                        {NOTIFICATION_PRESETS[option].label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-base-border bg-base-sunken px-3 py-2">
                    <span className="text-xs text-text-muted">Severity</span>
                    <select
                      value={severityFilter}
                      onChange={(event) => { setSeverityFilter(event.target.value as SeverityFilter); setCurrentPage(1); }}
                      className="input-base bg-transparent border-none px-0 text-sm text-white focus:ring-0"
                    >
                      {SEVERITY_FILTERS.map((option) => (
                        <option key={option} value={option}>{option === 'all' ? 'All' : capitalize(option)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <div>
                <CardTitle>Alert feed</CardTitle>
                <p className="text-xs text-text-muted">Select alerts for bulk actions and inspect each item in the detail panel.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="indigo" size="sm">{densityLabel}</Badge>
                {hasUnread && (
                  <Button size="sm" variant="ghost" onClick={markAllRead}>
                    Mark all read
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-xs text-text-muted">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-base-border bg-base-surface text-accent-indigo"
                    />
                    Select page
                  </label>
                  <Button size="sm" variant="ghost" onClick={handleMarkSelectedRead} disabled={!isAnySelected}>
                    Mark read
                  </Button>
                  <Button size="sm" variant="danger" onClick={handleDeleteSelected} disabled={!isAnySelected}>
                    Delete
                  </Button>
                </div>
                <div className="text-xs text-text-muted">Page {currentPage} of {pageCount}</div>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="rounded-2xl border border-base-border bg-base-surface p-6 text-center text-sm text-text-muted">Loading notifications…</div>
                ) : visibleNotifications.length === 0 ? (
                  <div className="rounded-2xl border border-base-border bg-base-surface p-6 text-center text-sm text-text-muted">
                    No notifications match your filters.
                  </div>
                ) : (
                  visibleNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={
                        `grid gap-3 rounded-2xl border px-4 py-4 transition-all ${
                          notification.read
                            ? 'border-base-border bg-base-surface'
                            : 'border-accent-indigo/30 bg-base-surface/70'
                        }`
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(notification.id)}
                              onChange={() => handleSelectToggle(notification.id)}
                              className="h-4 w-4 rounded border-base-border bg-base-surface text-accent-indigo"
                            />
                          </label>
                          <div className="flex h-8 w-8 items-center justify-center rounded-2xl" style={{ background: severityBg(notification.severity) }}>
                            <span className={severityColor(notification.severity)}>
                              {notification.severity === 'success' ? '✓' : notification.severity === 'warning' ? '!' : notification.severity === 'error' ? '×' : 'i'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => handleOpenNotification(notification)}
                              className="text-left"
                            >
                              <p className="text-sm font-semibold text-white truncate">{notification.title}</p>
                              <p className="mt-1 text-[12px] text-text-muted line-clamp-2">{truncate(notification.body, 100)}</p>
                            </button>
                          </div>
                        </div>
                        <Badge variant={getSeverityBadgeVariant(notification.severity)} size="sm">
                          {capitalize(notification.severity)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
                        <span>{getNotificationTypeLabel(notification.type)}</span>
                        <span>{formatRelativeTime(notification.created_at)}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!notification.read && (
                          <Button size="sm" variant="ghost" onClick={() => markRead(notification.id)}>
                            Mark read
                          </Button>
                        )}
                        <Button size="sm" variant="danger" onClick={() => deleteNotification(notification.id)}>
                          Delete
                        </Button>
                        {notification.action_url && (
                          <Link href={notification.action_url} className="text-xs text-accent-indigo hover:underline">
                            View details <ArrowRight className="inline-block w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {pageCount > 1 && (
                <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
                  <div>
                    Showing {visibleNotifications.length} of {filteredNotifications.length} alerts
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                      disabled={currentPage === pageCount}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <CardHeader>
              <div>
                <CardTitle>Alert details</CardTitle>
                <p className="text-xs text-text-muted">Inspect the selected notification and jump to follow-up actions.</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {activeNotification ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-base-surface p-3">
                      {getChannelIcon(activeNotification.type)}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-text-muted">{getNotificationTypeLabel(activeNotification.type)}</p>
                      <h2 className="text-lg font-semibold text-white">{activeNotification.title}</h2>
                      <p className="text-[11px] text-text-muted">{formatDate(activeNotification.created_at, 'short')}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-base-border bg-base-surface p-4 text-sm text-text-muted">
                    {activeNotification.body}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getSeverityBadgeVariant(activeNotification.severity)}>{capitalize(activeNotification.severity)}</Badge>
                    <Badge variant="indigo">{getNotificationTypeLabel(activeNotification.type)}</Badge>
                    {activeNotification.read ? (
                      <Badge variant="sky">Read</Badge>
                    ) : (
                      <Badge variant="orange">Unread</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!activeNotification.read && (
                      <Button size="sm" variant="ghost" onClick={() => markRead(activeNotification.id)}>
                        Mark as read
                      </Button>
                    )}
                    {activeNotification.action_url && (
                      <Link href={activeNotification.action_url} className="inline-flex items-center gap-2 text-xs font-medium text-accent-indigo hover:underline">
                        Open related page <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-base-border bg-base-surface p-6 text-sm text-text-muted">
                  Select a notification to view details.
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <div>
                <CardTitle>Notification preferences</CardTitle>
                <p className="text-xs text-text-muted">Control what updates arrive in your inbox and app feed.</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {user ? (
                <div className="space-y-3">
                  {(Object.keys(prefs) as Array<keyof NotificationPrefs>).map((key) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-base-border bg-base-surface p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{PREF_LABELS[key]}</p>
                        <p className="text-xs text-text-muted">{PREF_HINTS[key]}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefs[key]}
                        onChange={(event) => setPrefs({ ...prefs, [key]: event.target.checked })}
                        className="h-5 w-5 rounded border-base-border bg-base-surface text-accent-indigo"
                      />
                    </label>
                  ))}
                  <Button onClick={handleSavePreferences} loading={updatePrefsMutation.isPending}>
                    Save preferences
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border border-base-border bg-base-surface p-6 text-sm text-text-muted">
                  Sign in to manage notification preferences and get personalized alerts.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
