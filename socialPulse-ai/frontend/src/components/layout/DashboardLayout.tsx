/**
 * src/components/layout/DashboardLayout.tsx
 * Wraps all authenticated pages — sidebar + header + main content area.
 * Handles sidebar offset animation so content never overlaps the sidebar.
 */
'use client';

import { type ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarCollapsed, useStore } from '@/store';
import { HEADER_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { FullPageSpinner } from '@/components/ui/Spinner';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const collapsed = useSidebarCollapsed();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const { user, isLoading } = useAuth();
  // Persisted user from Zustand — available instantly without waiting for /me
  const persistedUser = useStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    // Only redirect when auth check is fully done AND no user in both query and store
    if (!isLoading && !user && !persistedUser) {
      router.replace('/login');
    }
  }, [isLoading, user, persistedUser, router]);

  // Use persisted user as fast-path — avoids spinner flash on navigation
  const resolvedUser = user ?? persistedUser;

  // Show spinner only while loading AND no cached user available
  if (isLoading && !resolvedUser) {
    return <FullPageSpinner />;
  }

  if (!resolvedUser) {
    // Redirect fires in useEffect — show spinner while it navigates
    return <FullPageSpinner />;
  }

  return (
    <div className="min-h-screen bg-base">
      <Sidebar />
      <Header />

      {/* Main content — offset from sidebar and header */}
      <motion.main
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ paddingTop: HEADER_HEIGHT }}
        className="min-h-screen"
      >
        <div className="p-4 sm:p-6 max-w-screen-2xl">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
