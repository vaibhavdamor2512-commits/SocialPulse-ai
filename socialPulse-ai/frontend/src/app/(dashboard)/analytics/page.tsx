/**
 * src/app/(dashboard)/analytics/page.tsx
 * Analytics — 4-tab deep-dive into all platform data.
 *
 * Tab 1 — Overview:    stat cards + followers + engagement charts
 * Tab 2 — Sentiment:   Watson NLP deep analysis (SentimentDeep)
 * Tab 3 — Hashtags:    sortable/searchable hashtag table
 * Tab 4 — Timing:      posting-times heatmap + platform comparison
 *
 * Data: TanStack Query → analyticsApi; placeholderData = mockData (no flash)
 */
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, RefreshCw, MessageSquare, Hash, Clock, LayoutGrid } from 'lucide-react';

import { analyticsApi }         from '@/lib/api';
import { QUERY_KEYS }           from '@/lib/constants';
import {
  mockAnalyticsOverview,
  mockSentiment,
} from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatNumber, formatRelativeTime, formatPercent } from '@/lib/utils';

import { OverviewStats }        from '@/components/dashboard/OverviewStats';
import { FollowersChart }       from '@/components/dashboard/FollowersChart';
import { EngagementChart }      from '@/components/analytics/EngagementChart';
import { SentimentDeep }        from '@/components/analytics/SentimentDeep';
import { HashtagsTable }        from '@/components/analytics/HashtagsTable';
import { PostingTimesHeatmap }  from '@/components/analytics/PostingTimesHeatmap';
import { PlatformComparison }   from '@/components/analytics/PlatformComparison';
import { PeriodSelector, type Period } from '@/components/analytics/PeriodSelector';

// ── Mock hashtag data (mirrors backend shape) ─────────────────────────────────
import type { TrendingHashtag } from '@/types';

const MOCK_HASHTAGS: TrendingHashtag[] = [
  { tag: '#AIContent',        posts: 12_400, reach: 142_000, trend: 'up',     pct_change: 34  },
  { tag: '#ShortFormVideo',   posts: 45_200, reach: 380_000, trend: 'up',     pct_change: 22  },
  { tag: '#CommunityFirst',   posts: 15_600, reach: 95_000,  trend: 'up',     pct_change: 15  },
  { tag: '#SustainableBrand', posts: 8_900,  reach: 62_000,  trend: 'down',   pct_change: -8  },
  { tag: '#VoiceSearch',      posts: 3_200,  reach: 28_000,  trend: 'stable', pct_change: 1   },
  { tag: '#DataDriven',       posts: 9_800,  reach: 71_000,  trend: 'up',     pct_change: 11  },
  { tag: '#GrowthHacking',    posts: 7_400,  reach: 55_000,  trend: 'up',     pct_change: 7   },
  { tag: '#ContentStrategy',  posts: 11_200, reach: 84_000,  trend: 'stable', pct_change: 2   },
  { tag: '#InfluencerMktg',   posts: 6_700,  reach: 48_000,  trend: 'down',   pct_change: -4  },
  { tag: '#BrandStorytelling',posts: 5_400,  reach: 39_000,  trend: 'up',     pct_change: 18  },
];

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Overview',  icon: LayoutGrid    },
  { id: 'sentiment', label: 'Sentiment', icon: MessageSquare },
  { id: 'hashtags',  label: 'Hashtags',  icon: Hash          },
  { id: 'timing',    label: 'Timing',    icon: Clock         },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [tab,    setTab]    = useState<TabId>('overview');
  const [period, setPeriod] = useState<Period>('30d');

  // ── Queries ──────────────────────────────────────────────────────────────
  const overview = useQuery({
    queryKey: QUERY_KEYS.analyticsOverview(period),
    queryFn:  () => analyticsApi.overview(period),
    placeholderData: mockAnalyticsOverview,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const sentiment = useQuery({
    queryKey: QUERY_KEYS.analyticsSentiment(),
    queryFn:  () => analyticsApi.sentiment(),
    placeholderData: mockSentiment,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const hashtags = useQuery({
    queryKey: QUERY_KEYS.trendingHashtags(20),
    queryFn:  () => analyticsApi.trendingHashtags(20),
    placeholderData: { hashtags: MOCK_HASHTAGS },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const postingTimes = useQuery({
    queryKey: QUERY_KEYS.bestPostingTimes(),
    queryFn:  analyticsApi.bestPostingTimes,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const overviewData   = overview.data   ?? mockAnalyticsOverview;
  const sentimentData  = sentiment.data  ?? mockSentiment;
  const hashtagList    = (hashtags.data?.hashtags ?? MOCK_HASHTAGS) as import('@/types').TrendingHashtag[];
  const postingData    = postingTimes.data?.posting_times;

  const isRefreshing   = overview.isFetching || sentiment.isFetching;

  const refetchAll = () => {
    overview.refetch();
    sentiment.refetch();
    hashtags.refetch();
    postingTimes.refetch();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* ── Page header ──────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <BarChart3 className="w-4.5 h-4.5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Analytics</h1>
            <p className="text-xs text-text-muted">
              Last updated {formatRelativeTime(new Date().toISOString())}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PeriodSelector value={period} onChange={setPeriod} />
          <button
            onClick={refetchAll}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-white
                       border border-base-border hover:border-brand-indigo/40 rounded-lg px-3 py-2
                       transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* ── Top KPI strip (always visible) ──────────────────────────── */}
      <motion.div variants={itemVariants}>
        <OverviewStats data={overviewData} loading={overview.isLoading} />
      </motion.div>

      {/* ── Quick metric row ─────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg Eng. Rate',   value: formatPercent(overviewData.avg_engagement_rate), sub: `${overviewData.engagement_growth > 0 ? '+' : ''}${formatPercent(overviewData.engagement_growth)} vs prev`, color: 'text-accent-indigo' },
          { label: 'Total Reach',     value: formatNumber(overviewData.total_reach),          sub: `+${formatPercent(overviewData.reach_growth)} growth`,   color: 'text-accent-purple' },
          { label: 'Followers',       value: formatNumber(overviewData.total_followers),      sub: `+${formatPercent(overviewData.follower_growth)} MoM`,    color: 'text-accent-green'  },
          { label: 'Watson Sentiment',value: `${sentimentData.overall_score}/100`,            sub: `${capitalize(sentimentData.label)} · ${sentimentData.score_change > 0 ? '+' : ''}${sentimentData.score_change}%`, color: 'text-accent-orange' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="card">
            <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] text-text-muted mt-1">{sub}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Tab bar ──────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-1 bg-base-sunken p-1 rounded-lg border border-base-border w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                tab === id
                  ? 'bg-base-surface text-white border border-base-border'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Tab content ──────────────────────────────────────────────── */}
      <motion.div key={tab} variants={itemVariants} className="space-y-5">

        {/* Overview tab */}
        {tab === 'overview' && (
          <>
            <div className="grid lg:grid-cols-2 gap-5">
              <FollowersChart  data={overviewData.followers_timeline}  loading={overview.isLoading} />
              <EngagementChart data={overviewData.engagement_timeline} loading={overview.isLoading} />
            </div>
            <PlatformComparison data={overviewData} loading={overview.isLoading} />
          </>
        )}

        {/* Sentiment tab */}
        {tab === 'sentiment' && (
          <SentimentDeep data={sentimentData} loading={sentiment.isLoading} />
        )}

        {/* Hashtags tab */}
        {tab === 'hashtags' && (
          <HashtagsTable data={hashtagList} loading={hashtags.isLoading} />
        )}

        {/* Timing tab */}
        {tab === 'timing' && (
          <div className="space-y-5">
            <PostingTimesHeatmap data={postingData} loading={postingTimes.isLoading} />
            <PlatformComparison  data={overviewData} loading={overview.isLoading} />
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
