/**
 * src/components/dashboard/OverviewStats.tsx
 * 4-stat row: Total Followers, Total Reach, Avg Engagement, Total Posts.
 * Reads from AnalyticsOverview; shows skeleton placeholders while loading.
 */
'use client';

import { Users, Eye, TrendingUp, FileText } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatNumber } from '@/lib/utils';
import type { AnalyticsOverview } from '@/types';

interface OverviewStatsProps {
  data: AnalyticsOverview | undefined;
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-3 w-20 bg-base-border rounded" />
        <div className="w-8 h-8 rounded-lg bg-base-border" />
      </div>
      <div className="h-7 w-28 bg-base-border rounded mb-2" />
      <div className="h-3 w-16 bg-base-border rounded" />
    </div>
  );
}

export function OverviewStats({ data, loading }: OverviewStatsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Followers',
      value: formatNumber(data.total_followers),
      growth: data.follower_growth,
      subtitle: 'across all platforms',
      icon: <Users className="w-4 h-4" />,
      accentColor: '#6172f3',
    },
    {
      title: 'Total Reach',
      value: formatNumber(data.total_reach),
      growth: data.reach_growth,
      subtitle: 'this period',
      icon: <Eye className="w-4 h-4" />,
      accentColor: '#a855f7',
    },
    {
      title: 'Avg Engagement',
      value: `${data.avg_engagement_rate.toFixed(1)}%`,
      growth: data.engagement_growth,
      subtitle: 'rate',
      icon: <TrendingUp className="w-4 h-4" />,
      accentColor: '#ec4899',
    },
    {
      title: 'Total Posts',
      value: data.total_posts.toLocaleString(),
      subtitle: `in last ${data.period}`,
      icon: <FileText className="w-4 h-4" />,
      accentColor: '#4ade80',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((s) => (
        <motion.div key={s.title} variants={itemVariants}>
          <StatCard {...s} />
        </motion.div>
      ))}
    </motion.div>
  );
}
