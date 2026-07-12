'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, RefreshCw } from 'lucide-react';

import { trendsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { containerVariants, itemVariants } from '@/lib/motion';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { TrendPrediction } from '@/types';

const MOCK_TRENDS: TrendPrediction[] = [
  { hashtag: '#AIContent',       category: 'Technology', current_volume: 12_400, predicted_volume: 18_600, confidence: 87, direction: 'up',     weeks: [12400,13800,14900,15800,17200,18600], peak_day: 'Tuesday',   related_hashtags: ['#GenerativeAI','#AIMarketing'] },
  { hashtag: '#ShortFormVideo',  category: 'Media',      current_volume: 45_200, predicted_volume: 62_000, confidence: 92, direction: 'up',     weeks: [45200,47800,51000,54200,57800,62000], peak_day: 'Friday',    related_hashtags: ['#Reels','#VideoContent'] },
  { hashtag: '#CommunityFirst',  category: 'Community',  current_volume: 15_600, predicted_volume: 19_200, confidence: 78, direction: 'up',     weeks: [15600,16400,17100,17800,18600,19200], peak_day: 'Thursday',  related_hashtags: ['#Community','#BuildInPublic'] },
  { hashtag: '#SustainableBrand',category: 'Brand',      current_volume: 8_900,  predicted_volume: 6_800,  confidence: 74, direction: 'down',   weeks: [8900,8600,8200,7900,7500,6800],       peak_day: 'Wednesday', related_hashtags: ['#GreenMarketing','#ESG'] },
  { hashtag: '#VoiceSearch',     category: 'SEO',        current_volume: 3_200,  predicted_volume: 3_300,  confidence: 65, direction: 'stable', weeks: [3200,3180,3210,3190,3170,3300],       peak_day: 'Monday',    related_hashtags: ['#SEO','#VoiceMarketing'] },
  { hashtag: '#DataDriven',      category: 'Analytics',  current_volume: 9_800,  predicted_volume: 13_100, confidence: 83, direction: 'up',     weeks: [9800,10400,11200,11900,12500,13100],   peak_day: 'Tuesday',   related_hashtags: ['#Analytics','#DataScience'] },
];

const DIRECTION_BADGE: Record<string, 'green' | 'pink' | 'default'> = {
  up: 'green',
  down: 'pink',
  stable: 'default',
};

const DIRECTION_LABEL: Record<string, string> = {
  up: '↑ Rising',
  down: '↓ Falling',
  stable: '→ Stable',
};

export default function TrendsPage() {
  const trendsQuery = useQuery({
    queryKey: QUERY_KEYS.trends(),
    queryFn: () => trendsApi.list(),
    placeholderData: { predictions: MOCK_TRENDS },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const viralityQuery = useQuery({
    queryKey: QUERY_KEYS.virality,
    queryFn: () => trendsApi.virality(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const predictions = (trendsQuery.data as { predictions: typeof MOCK_TRENDS })?.predictions ?? MOCK_TRENDS;
  const virality = (viralityQuery.data as { predictions: Array<{ content_type: string; platform: string; virality_score: number; predicted_reach: number; confidence: number; key_factors: string[] }> })?.predictions ?? [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
            <TrendingUp className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="text-lg font-extrabold text-white tracking-tight">Trend Prediction</h1>
            <p className="text-xs text-text-muted">IBM Granite-powered 6-week trend forecast</p>
          </div>
        </div>
        <button
          onClick={() => { trendsQuery.refetch(); viralityQuery.refetch(); }}
          disabled={trendsQuery.isFetching}
          className="flex items-center gap-2 text-xs text-text-muted hover:text-white border border-base-border hover:border-brand-indigo/40 rounded-lg px-3 py-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${trendsQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </motion.div>

      {/* Trend predictions grid */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {predictions.map((trend) => (
          <Card key={trend.hashtag} className="p-4 space-y-3 card-hover">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-white text-sm">{trend.hashtag}</p>
                <p className="text-[11px] text-text-muted mt-0.5">{trend.category}</p>
              </div>
              <Badge variant={DIRECTION_BADGE[trend.direction]} size="sm">
                {DIRECTION_LABEL[trend.direction]}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-base-sunken p-2">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Current</p>
                <p className="text-lg font-black text-accent-indigo">{(trend.current_volume / 1000).toFixed(1)}K</p>
              </div>
              <div className="rounded-xl bg-base-sunken p-2">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Predicted</p>
                <p className="text-lg font-black text-accent-green">{(trend.predicted_volume / 1000).toFixed(1)}K</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-text-muted">Confidence</span>
                <span className="text-[11px] text-white font-semibold">{trend.confidence}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-base-sunken overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-gradient"
                  style={{ width: `${trend.confidence}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Virality predictions */}
      {virality.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="p-4">
            <CardHeader>
              <CardTitle>Virality Predictions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {virality.slice(0, 6).map((v, i) => (
                  <div key={i} className="rounded-xl border border-base-border bg-base-sunken p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-white">{v.content_type}</p>
                      <Badge variant="default" size="sm">{v.platform}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-base-border overflow-hidden">
                        <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${v.virality_score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-accent-purple">{v.virality_score}</span>
                    </div>
                    <p className="text-[11px] text-text-muted">~{(v.predicted_reach / 1000).toFixed(0)}K reach · {v.confidence}% confidence</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Powered by banner */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-brand-indigo/20 bg-surface-gradient p-4 text-center">
        <p className="text-xs text-text-muted">
          Powered by <span className="text-accent-indigo font-semibold">IBM Granite 13B</span> + <span className="text-accent-purple font-semibold">IBM Watson NLP</span> — predictions updated every 6 hours
        </p>
      </motion.div>
    </motion.div>
  );
}
