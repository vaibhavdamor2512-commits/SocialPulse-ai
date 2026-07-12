/**
 * src/app/(dashboard)/dashboard/page.tsx
 * Main Dashboard — real-time overview of all platforms.
 *
 * Data:        TanStack Query → analyticsApi + instagramApi (real) + mockData fallback
 * Layout:      4-stat row, chart + hashtags, sentiment + campaigns + AI insights
 * Animations:  Framer Motion fade-up stagger on mount
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { RefreshCw, LayoutDashboard, Instagram, Heart, MessageCircle, Eye, Users } from 'lucide-react';

import { analyticsApi, instagramApi } from '@/lib/api';
import { QUERY_KEYS }     from '@/lib/constants';
import type { TrendingHashtag, InstagramPost } from '@/types';
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

  // ── Real Instagram data (silently skipped if not configured) ────────────────
  const igProfile = useQuery({
    queryKey: ['instagram', 'profile'],
    queryFn: instagramApi.profile,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const igMedia = useQuery({
    queryKey: ['instagram', 'media'],
    queryFn: () => instagramApi.media(6),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const igInsights = useQuery({
    queryKey: ['instagram', 'insights'],
    queryFn: () => instagramApi.insights('day'),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const isLoading = overview.isLoading || sentiment.isLoading || hashtags.isLoading;
  const lastUpdated = new Date().toISOString();

  return { overview, sentiment, hashtags, igProfile, igMedia, igInsights, isLoading, lastUpdated };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { overview, sentiment, hashtags, igProfile, igMedia, igInsights, isLoading, lastUpdated } = useDashboardData();

  const overviewData  = overview.data  ?? mockAnalyticsOverview;
  const sentimentData = sentiment.data ?? mockSentiment;
  const hashtagData   = (hashtags.data?.hashtags ?? []) as TrendingHashtag[];
  const igConfigured  = !igProfile.isError;
  const igPosts       = igMedia.data ?? [];

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

      {/* ── Row 5: Instagram Live Panel ───────────────────────────────── */}
      <motion.div variants={itemVariants} className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-[#e1306c]" />
            <h3 className="text-sm font-semibold text-white">Instagram Live Data</h3>
            {igConfigured && igProfile.data && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e1306c]/15 text-[#e1306c] border border-[#e1306c]/30">
                @{igProfile.data.username}
              </span>
            )}
          </div>
          {!igConfigured && (
            <span className="text-[10px] text-text-muted px-2 py-1 rounded border border-base-border">
              Configure Instagram credentials in .env to enable
            </span>
          )}
        </div>

        {/* Profile stats row — real data when configured */}
        {igConfigured && igProfile.data ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { icon: Users,         label: 'Followers',    value: igProfile.data.followers_count.toLocaleString() },
                { icon: Eye,           label: 'Posts',        value: igProfile.data.media_count.toLocaleString() },
                { icon: Eye,           label: 'Reach (today)',value: (igInsights.data?.reach ?? '—').toLocaleString() },
                { icon: Eye,           label: 'Impressions',  value: (igInsights.data?.impressions ?? '—').toLocaleString() },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-base-surface rounded-lg p-3 border border-base-border">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-lg font-black text-[#e1306c]">{value}</p>
                </div>
              ))}
            </div>

            {/* Recent posts grid */}
            {igPosts.length > 0 && (
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2">Recent Posts</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {igPosts.slice(0, 6).map((post: InstagramPost) => (
                    <a
                      key={post.id}
                      href={post.permalink ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden bg-base-surface border border-base-border hover:border-[#e1306c]/50 transition-colors"
                    >
                      {post.media_url ? (
                        <img
                          src={post.media_url}
                          alt={post.caption?.slice(0, 40) ?? 'post'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Instagram className="w-6 h-6 text-text-dim" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <span className="flex items-center gap-1 text-[11px] text-white">
                          <Heart className="w-3 h-3" />{post.like_count}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-white">
                          <MessageCircle className="w-3 h-3" />{post.comments_count}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Placeholder when Instagram not configured */
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Instagram className="w-8 h-8 text-text-dim mb-2" />
            <p className="text-sm text-text-muted">Instagram not connected</p>
            <p className="text-[11px] text-text-dim mt-1">
              Add META_APP_ID, META_APP_SECRET, INSTAGRAM_ACCESS_TOKEN, and<br />
              INSTAGRAM_BUSINESS_ACCOUNT_ID to <code className="text-[#e1306c]">backend/.env</code>
            </p>
          </div>
        )}
      </motion.div>

      {/* ── Row 6: Recent notifications strip ────────────────────────── */}
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
