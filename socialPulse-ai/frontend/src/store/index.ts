/**
 * src/store/index.ts
 * Zustand global store — auth state, UI state, notifications.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Notification, User } from '@/types';

// ── Auth slice ────────────────────────────────────────────────────────────────
interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// ── UI slice ──────────────────────────────────────────────────────────────────
interface UISlice {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

// ── Notifications slice ───────────────────────────────────────────────────────
interface NotificationsSlice {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

// ── Combined store ────────────────────────────────────────────────────────────
type StoreState = AuthSlice & UISlice & NotificationsSlice;

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // ── Auth ────────────────────────────────────────────────────────────────
      user: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: user !== null }),

      logout: () =>
        set({ user: null, isAuthenticated: false }),

      // ── UI ──────────────────────────────────────────────────────────────────
      sidebarOpen: true,
      sidebarCollapsed: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // ── Notifications ────────────────────────────────────────────────────────
      notifications: [],
      unreadCount: 0,

      setNotifications: (notifications) => set({ notifications }),
      setUnreadCount: (unreadCount) => set({ unreadCount }),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, s.unreadCount - 1),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),
    }),
    {
      name: 'socialpulse-store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      // Only persist UI prefs and auth, not ephemeral notifications
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// ── Selector hooks ────────────────────────────────────────────────────────────
export const useUser = () => useStore((s) => s.user);
export const useIsAuthenticated = () => useStore((s) => s.isAuthenticated);
export const useSidebarCollapsed = () => useStore((s) => s.sidebarCollapsed);
export const useToggleSidebar = () => useStore((s) => s.toggleSidebar);
export const useUnreadCount = () => useStore((s) => s.unreadCount);
