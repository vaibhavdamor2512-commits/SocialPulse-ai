/**
 * src/components/ui/Tabs.tsx
 */
'use client';

import { cn } from '@/lib/utils';
import { type ReactNode, useState } from 'react';

interface Tab { id: string; label: string; icon?: ReactNode }
interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => ReactNode;
  className?: string;
}

export function Tabs({ tabs, defaultTab, children, className }: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');
  return (
    <div className={className}>
      <div className="flex gap-1 bg-base-sunken p-1 rounded-lg border border-base-border w-fit mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
              active === tab.id
                ? 'bg-base-surface text-white shadow-sm border border-base-border'
                : 'text-text-muted hover:text-text-secondary',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div>{children(active)}</div>
    </div>
  );
}
