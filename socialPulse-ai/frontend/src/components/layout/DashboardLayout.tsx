/**
 * src/components/layout/DashboardLayout.tsx
 * Wraps all authenticated pages — sidebar + header + main content area.
 * Handles sidebar offset animation so content never overlaps the sidebar.
 */
'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarCollapsed } from '@/store';
import { HEADER_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/lib/constants';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const collapsed = useSidebarCollapsed();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

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
