/**
 * src/components/layout/Header.tsx
 * Top header bar — search, notifications bell, user menu.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, LogOut, Settings, User as UserIcon, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { HEADER_HEIGHT } from '@/lib/constants';
import { useSidebarCollapsed } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { severityColor } from '@/lib/utils';

// ── Page title from pathname ──────────────────────────────────────────────────
function usePageTitle(): string {
  const pathname = usePathname();
  const titles: Record<string, string> = {
    '/dashboard':   'Dashboard',
    '/assistant':   'AI Assistant',
    '/analytics':   'Analytics',
    '/campaigns':   'Campaign Planner',
    '/competitors': 'Competitor Analysis',
    '/trends':      'Trend Prediction',
    '/influencers': 'Influencer Mapping',
    '/reports':     'Reports',
    '/settings':    'Settings',
    '/notifications':'Notifications',
    '/contact':     'Contact',
  };
  return titles[pathname] ?? 'SocialPulse AI';
}

// ── Notifications dropdown ────────────────────────────────────────────────────
function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markRead, markAllRead, isLoading } = useNotifications();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-text-muted hover:text-white hover:bg-base-surface border border-transparent hover:border-base-border transition-all"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-orange rounded-full" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 card shadow-card z-50 border border-base-border"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs font-bold text-accent-orange bg-accent-orange/15 px-1.5 py-0.5 rounded-chip">
                    {unreadCount}
                  </span>
                )}
              </p>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-xs text-accent-indigo hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-4"><Spinner size="sm" /></div>
              ) : notifications.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No notifications</p>
              ) : (
                notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); setOpen(false); }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-100',
                      n.read ? 'hover:bg-base-surface' : 'bg-base-surface/50 hover:bg-base-surface',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', severityColor(n.severity).replace('text-', 'bg-'))} />
                      )}
                      <div className={cn('flex-1 min-w-0', n.read && 'ml-3.5')}>
                        <p className="text-xs font-medium text-text-primary truncate">{n.title}</p>
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-text-dim mt-1">{formatRelativeTime(n.created_at)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="border-t border-base-border mt-3 pt-2">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block text-xs text-accent-indigo text-center hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── User menu ─────────────────────────────────────────────────────────────────
function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-base-surface border border-transparent hover:border-base-border transition-all"
      >
        <Avatar src={user.avatar_url} name={user.name} size="sm" />
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
          <p className="text-[10px] text-text-muted capitalize leading-tight">{user.plan} plan</p>
        </div>
        <ChevronDown className="w-3 h-3 text-text-muted ml-0.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 card shadow-card z-50"
          >
            <div className="pb-2 mb-2 border-b border-base-border">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-text-muted truncate">{user.email}</p>
            </div>
            <div className="space-y-0.5">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-base-surface transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
              <Link
                href="/settings#profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs text-text-secondary hover:text-white hover:bg-base-surface transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Profile
              </Link>
            </div>
            <div className="border-t border-base-border mt-2 pt-2">
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
export function Header() {
  const collapsed = useSidebarCollapsed();
  const title = usePageTitle();
  const sidebarW = collapsed ? 64 : 240;

  return (
    <header
      style={{ height: HEADER_HEIGHT, left: sidebarW }}
      className="fixed top-0 right-0 z-20 bg-base/80 backdrop-blur-md border-b border-base-border transition-[left] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
    >
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        {/* Page title */}
        <h1 className="text-sm font-bold text-white">{title}</h1>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
