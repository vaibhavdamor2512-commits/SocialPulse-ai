/**
 * src/components/layout/Sidebar.tsx
 * Animated, collapsible sidebar with active-route highlighting.
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Bot, BarChart3, Rocket, Target,
  TrendingUp, Star, FileText, Settings, Mail,
  ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME, MAIN_NAV, BOTTOM_NAV, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/lib/constants';
import { useSidebarCollapsed, useToggleSidebar, useUnreadCount } from '@/store';
import { Tooltip } from '@/components/ui/Tooltip';

// ── Icon map ──────────────────────────────────────────────────────────────────
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Bot, BarChart3, Rocket, Target,
  TrendingUp, Star, FileText, Settings, Mail,
};

// ── Nav item ─────────────────────────────────────────────────────────────────
interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
  badge?: string | number;
  collapsed: boolean;
}

function NavLink({ href, icon, label, badge, collapsed }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  const Icon = ICONS[icon] ?? LayoutDashboard;

  const inner = (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative',
        isActive
          ? 'bg-brand-indigo/15 text-white border border-brand-indigo/30'
          : 'text-text-muted hover:text-text-secondary hover:bg-base-surface border border-transparent',
        collapsed && 'justify-center px-0',
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-gradient rounded-r" />
      )}
      <Icon
        className={cn(
          'w-4 h-4 flex-shrink-0 transition-colors',
          isActive ? 'text-accent-indigo' : 'text-text-muted group-hover:text-text-secondary',
        )}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap flex-1"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && badge && (
        <span className="ml-auto bg-brand-indigo/20 text-accent-indigo text-[10px] font-bold px-1.5 py-0.5 rounded-chip border border-brand-indigo/30">
          {badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return <Tooltip content={label} side="right">{inner}</Tooltip>;
  }
  return inner;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar() {
  const collapsed = useSidebarCollapsed();
  const toggle = useToggleSidebar();
  const unreadCount = useUnreadCount();

  return (
    <motion.aside
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-0 top-0 z-30 h-screen bg-base-sunken border-r border-base-border flex flex-col overflow-hidden"
    >
      {/* Brand */}
      <div className={cn('flex items-center h-16 px-4 border-b border-base-border flex-shrink-0', collapsed && 'justify-center px-0')}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-black text-gradient whitespace-nowrap overflow-hidden"
              >
                {APP_NAME}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
        {MAIN_NAV.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            collapsed={collapsed}
            badge={item.href === '/notifications' ? unreadCount || undefined : item.badge}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-base-border mx-2" />

      {/* Bottom nav */}
      <nav className="px-2 py-3 space-y-0.5">
        {BOTTOM_NAV.map((item) => (
          <NavLink key={item.href} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-base-border p-2">
        <button
          onClick={toggle}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted',
            'hover:text-text-secondary hover:bg-base-surface transition-colors duration-150',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
