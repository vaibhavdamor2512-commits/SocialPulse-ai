/**
 * src/app/(dashboard)/dashboard/page.tsx
 * Main Dashboard — real-time overview of all platforms.
 *
 * Data:        TanStack Query → analyticsApi + mockData fallback
 * Layout:      4-stat row, chart + hashtags, sentiment + campaigns + AI insights
 * Animations:  Framer Motion fade-up stagger on mount
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

import { analyticsApi }   from '@/lib/api';
import { QUERY_KEYS }     from '@/lib/constants';
import {
  mockAnalyticsOverview,
  mockSentiment,
  mockCampaigns,
  mockNotifications,
} from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatRelativeTime } from '@/lib/utils';

import { OverviewStats }     from '@/components/dashboard/OverviewStats';
import { FollowersChart }    from '@/components/dashboard/FollowersChart';
import { PlatformBreakdown } from '@/components/dashboard/PlatformBreakdown';
import { TrendingHashtags }  from '@/components/dashboard/TrendingHashtags';
import { SentimentWidget }   from '@/components/dashboard/SentimentWidget';
import { RecentCampaigns }   from '@/components/dashboard/RecentCampaigns';
import { QuickInsights }     from '@/components/dashboard/QuickInsights';

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useDashboardData() {
  const overview = useQuery({
    queryKey: QUERY_KEYS.analyticsOverview('30d'),
    queryFn: () => analyticsApi.overview('30d'),
    placeholderData: mockAnalyticsOverview,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const sentiment = useQuery({
    queryKey: QUERY_KEYS.analyticsSentiment(),
    queryFn: () => analyticsApi.sentiment(),
    placeholderData: mockSentiment,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const hashtags = useQuery({
    queryKey: QUERY_KEYS.trendingHashtags(8),
    queryFn: () => analyticsApi.trendingHashtags(8),
    placeholderData: {
      hashtags: [
        { tag: '#AIContent',       posts: 12_400, reach: 142_000, trend: 'up'     as const, pct_change: 34 },
        { tag: '#ShortFormVideo',  posts: 45_200, reach: 380_000, trend: 'up'     as const, pct_change: 22 },
        { tag: '#CommunityFirst',  posts: 15_600, reach: 95_000,  trend: 'up'     as const, pct_change: 15 },
        { tag: '#SustainableBrand',posts: 8_900,  reach: 62_000,  trend: 'down'   as const, pct_change: -8 },
        { tag: '#VoiceSearch',     posts: 3_200,  reach: 28_000,  trend: 'stable' as const, pct_change: 1  },
        { tag: '#DataDriven',      posts: 9_800,  reach: 71_000,  trend: 'up'     as const, pct_change: 11 },
        { tag: '#GrowthHacking',   posts: 7_400,  reach: 55_000,  trend: 'up'     as const, pct_change: 7  },
        { tag: '#ContentStrategy', posts: 11_200, reach: 84_000,  trend: 'stable' as const, pct_change: 2  },
      ],
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isLoading = overview.isLoading || sentiment.isLoading || hashtags.isLoading;
  const lastUpdated = new Date().toISOString();

  return { overview, sentiment, hashtags, isLoading, lastUpdated };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { overview, sentiment, hashtags, isLoading, lastUpdated } = useDashboardData();

  const overviewData  = overview.data  ?? mockAnalyticsOverview;
  const sentimentData = sentiment.data ?? mockSentiment;
  const hashtagData   = hashtags.data?.hashtags ?? [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <LayoutDashboard className="w-4.5 h-4.5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Overview</h1>
            <p className="text-xs text-text-muted">
              Updated {formatRelativeTime(lastUpdated)}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            overview.refetch();
            sentiment.refetch();
            hashtags.refetch();
          }}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white
                     border border-base-border hover:border-brand-indigo/40 rounded-lg px-3 py-2
                     transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <OverviewStats data={overviewData} loading={overview.isLoading} />
      </motion.div>

      {/* ── Row 2: Followers chart + Trending hashtags ────────────────── */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FollowersChart
            data={overviewData.followers_timeline}
            loading={overview.isLoading}
          />
        </div>
        <div>
          <TrendingHashtags data={hashtagData} loading={hashtags.isLoading} />
        </div>
      </motion.div>

      {/* ── Row 3: Sentiment + Campaigns + AI Insights ───────────────── */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
        <div>
          <SentimentWidget data={sentimentData} loading={sentiment.isLoading} />
        </div>
        <div>
          <RecentCampaigns data={mockCampaigns} loading={false} />
        </div>
        <div>
          <QuickInsights />
        </div>
      </motion.div>

      {/* ── Row 4: Platform breakdown table ──────────────────────────── */}
      <motion.div variants={itemVariants}>
        <PlatformBreakdown data={overviewData} loading={overview.isLoading} />
      </motion.div>

      {/* ── Row 5: Recent notifications strip ────────────────────────── */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Recent Alerts</h3>
          <a href="/notifications" className="text-xs text-accent-indigo hover:underline">View all</a>
        </div>
        <div className="space-y-2">
          {mockNotifications.slice(0, 3).map((n) => (
            <div
              key={n.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-base border border-base-border"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${
                  n.severity === 'success' ? 'bg-accent-green' :
                  n.severity === 'warning' ? 'bg-accent-orange' :
                  n.severity === 'error'   ? 'bg-red-400' : 'bg-accent-sky'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary leading-snug">{n.title}</p>
                <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{n.body}</p>
              </div>
              <span className="text-[10px] text-text-dim whitespace-nowrap flex-shrink-0 mt-0.5">
                {formatRelativeTime(n.created_at)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
