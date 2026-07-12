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
import { useSidebarCollapsed } from '@/store';
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
  const router = useRouter();

  useEffect(() => {
    // If auth check is done and there is no user, send to login
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  // Show spinner while verifying the session
  // (isLoading=true means the /me request is in-flight; user=null with isLoading=false means unauthenticated)
  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!user) {
    // Redirect is handled in the useEffect above; show spinner while it fires
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
