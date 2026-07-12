'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { competitorsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/constants';
import { mockCompetitors } from '@/lib/mockData';
import { containerVariants, itemVariants } from '@/lib/motion';
import { formatNumber, platformLabel } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { SWOTAnalysis, AIRecommendation } from '@/types';

const PLATFORM_BADGES: Record<string, 'green' | 'orange' | 'sky' | 'pink' | 'indigo'> = {
  instagram: 'pink',
  twitter: 'sky',
  linkedin: 'indigo',
  facebook: 'green',
};

const MOCK_SWOT: SWOTAnalysis = {
  competitor: 'Competitor',
  analysis: 'This competitor has a strong visual identity and high engagement, but could improve sentiment by prioritizing more educational content. Their posting consistency is a major strength, while broader audience segmentation is a key opportunity.',
  structured: {
    strengths: ['Strong visual storytelling', 'High posting cadence', 'Clear platform positioning'],
    weaknesses: ['Limited diversified content formats', 'Under-indexed on business outcomes', 'Inconsistent cross-platform messaging'],
    opportunities: ['Expand thought leadership series', 'Leverage emerging hashtags', 'Boost LinkedIn case studies'],
    threats: ['New product announcements from rivals', 'Paid amplification fatigue', 'Audience saturation in tech keywords'],
  },
  powered_by: 'ibm/granite-13b-instruct-v2',
};

const MOCK_RECOMMENDATIONS: AIRecommendation[] = [
  {
    title: 'Strengthen content differentiation',
    description: 'Position your brand with more product-led insights and problem-solving narratives to stand apart from high-volume competitor feeds.',
    priority: 'high',
    potential_impact: 'Higher share of voice and audience recall',
  },
  {
    title: 'Double down on sentiment-driven posts',
    description: 'Publish more behind-the-scenes and community stories to convert positive sentiment into follower growth.',
    priority: 'medium',
    potential_impact: 'Improved brand affinity and engagement consistency',
  },
  {
    title: 'Test multi-format storytelling',
    description: 'Use short-form video, carousels, and LinkedIn articles around AI outcomes to capture broader attention across channels.',
    priority: 'low',
    potential_impact: 'Increased reach and content diversity',
  },
];

export default function CompetitorDetailPage() {
  const params = useParams();
  const competitorId = params?.id as string;

  const competitorsQuery = useQuery({
    queryKey: QUERY_KEYS.competitors,
    queryFn: competitorsApi.list,
    placeholderData: mockCompetitors,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const competitor = useMemo(() => {
    return competitorsQuery.data?.find((item) => item.id === competitorId)
      ?? mockCompetitors.find((item) => item.id === competitorId);
  }, [competitorsQuery.data, competitorId]);

  const swotQuery = useQuery({
    queryKey: QUERY_KEYS.competitorSwot(competitor?.name),
    queryFn: () => competitorsApi.swot(competitor?.name),
    placeholderData: { ...MOCK_SWOT, competitor: competitor?.name ?? MOCK_SWOT.competitor },
    enabled: Boolean(competitor?.name),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const recommendationsQuery = useQuery({
    queryKey: QUERY_KEYS.competitorRecommendations,
    queryFn: competitorsApi.recommendations,
    placeholderData: MOCK_RECOMMENDATIONS,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (!competitor && !competitorsQuery.isLoading) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-text-muted">Competitor not found.</p>
        <Link href="/competitors" className="mt-4 inline-flex items-center justify-center rounded-lg border border-base-border px-4 py-2 text-sm text-white hover:border-accent-indigo hover:text-accent-indigo">
          Back to competitors
        </Link>
      </div>
    );
  }

  const swot = swotQuery.data as SWOTAnalysis;
  const recommendations = recommendationsQuery.data as AIRecommendation[];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/competitors" className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to competitors
          </Link>
          <div className="mt-3">
            <h1 className="text-lg font-extrabold text-white tracking-tight">{competitor?.name ?? 'Competitor profile'}</h1>
            <p className="text-xs text-text-muted max-w-2xl">
              Deep competitive intelligence, sentiment signals, and AI-powered strategy recommendations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => toast('Exporting competitor profile...')}>
            Export profile
          </Button>
          <Button leftIcon={<Sparkles className="w-4 h-4" />} size="sm">
            Build strategy
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
        <div className="space-y-6">
          <Card className="p-4">
            <CardHeader>
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted">Competitor snapshot</p>
                <h2 className="text-xl font-semibold text-white mt-2">{competitor?.handle}</h2>
              </div>
              <Badge variant={PLATFORM_BADGES[competitor?.platform ?? 'instagram'] ?? 'green'}>
                {platformLabel(competitor?.platform ?? 'instagram')}
              </Badge>
            </CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <p className="text-[11px] uppercase tracking-widest text-text-muted">Followers</p>
                <p className="text-3xl font-black text-white mt-3">{formatNumber(competitor?.followers ?? 0, false)}</p>
              </div>
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <p className="text-[11px] uppercase tracking-widest text-text-muted">Growth rate</p>
                <p className="text-3xl font-black text-accent-green mt-3">{competitor?.growth_rate.toFixed(1)}%</p>
              </div>
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <p className="text-[11px] uppercase tracking-widest text-text-muted">Engagement</p>
                <p className="text-3xl font-black text-accent-purple mt-3">{competitor?.engagement.toFixed(1)}%</p>
              </div>
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <p className="text-[11px] uppercase tracking-widest text-text-muted">Sentiment</p>
                <p className="text-3xl font-black text-accent-sky mt-3">{competitor?.sentiment}%</p>
              </div>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Top hashtags</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-wrap gap-2">
              {competitor?.top_hashtags.map((hashtag) => (
                <Badge key={hashtag} variant="default" size="sm">{hashtag}</Badge>
              ))}
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>Performance signals</CardTitle>
            </CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <p className="text-[11px] uppercase tracking-widest text-text-muted">Posts / wk</p>
                <p className="text-lg font-semibold text-white mt-2">{competitor?.posts_per_week}</p>
              </div>
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <p className="text-[11px] uppercase tracking-widest text-text-muted">Engagement score</p>
                <p className="text-lg font-semibold text-white mt-2">{competitor?.engagement.toFixed(1)}%</p>
              </div>
              <div className="rounded-3xl border border-base-border bg-base-surface p-4">
                <p className="text-[11px] uppercase tracking-widest text-text-muted">Sentiment</p>
                <p className="text-lg font-semibold text-white mt-2">{competitor?.sentiment}%</p>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-4">
            <CardHeader>
              <CardTitle>AI SWOT analysis</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-text-muted">{swot?.analysis}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(swot?.structured ?? {}).map(([label, items]) => (
                  <div key={label} className="rounded-3xl border border-base-border bg-base-surface p-4">
                    <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">{label}</p>
                    <ul className="list-disc ml-4 space-y-2 text-sm text-white">
                      {(items as string[]).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-text-muted">Powered by {swot?.powered_by}</p>
            </CardBody>
          </Card>

          <Card className="p-4">
            <CardHeader>
              <CardTitle>AI recommendations</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {recommendations.map((recommendation) => (
                <div key={recommendation.title} className="rounded-3xl border border-base-border bg-base-surface p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{recommendation.title}</p>
                    <Badge variant={recommendation.priority === 'high' ? 'pink' : recommendation.priority === 'medium' ? 'orange' : 'green'} size="sm">
                      {recommendation.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-muted mt-2">{recommendation.description}</p>
                  <p className="text-[11px] text-text-muted mt-3">Impact: {recommendation.potential_impact}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
