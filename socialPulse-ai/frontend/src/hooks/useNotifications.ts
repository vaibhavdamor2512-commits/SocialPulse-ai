/**
 * src/hooks/useNotifications.ts
 * Notification polling, mark-read, and unread-count management.
 */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { notificationsApi, hasToken } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockNotifications } from '@/lib/mockData';
import { useStore } from '@/store';

export function useNotifications(options?: { unreadOnly?: boolean }) {
  const qc = useQueryClient();
  const { setNotifications, setUnreadCount, markRead: storeMarkRead, markAllRead: storeMarkAll } = useStore();

  const placeholderNotifications = options?.unreadOnly
    ? mockNotifications.filter((notification) => !notification.read)
    : mockNotifications;

  const query = useQuery({
    queryKey: QUERY_KEYS.notifications(options?.unreadOnly),
    queryFn: () => notificationsApi.list({ unread_only: options?.unreadOnly, limit: 100, skip: 0 }),
    placeholderData: {
      notifications: placeholderNotifications,
      total: placeholderNotifications.length,
      unread_count: placeholderNotifications.filter((notification) => !notification.read).length,
      page: { skip: 0, limit: 100 },
    },
    // Poll every 60 seconds for new notifications
    refetchInterval: 60_000,
    enabled: hasToken(),
  });

  // Sync Zustand store whenever the query resolves
  useEffect(() => {
    if (query.data) {
      setNotifications(query.data.notifications);
      setUnreadCount(query.data.unread_count);
    }
  }, [query.data, setNotifications, setUnreadCount]);

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: (_data, id) => {
      storeMarkRead(id);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      storeMarkAll();
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.notifications() });
    },
  });

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unread_count ?? 0,
    isLoading: query.isLoading,
    markRead: markReadMutation.mutate,
    markAllRead: markAllMutation.mutate,
    deleteNotification: deleteMutation.mutate,
  };
}
