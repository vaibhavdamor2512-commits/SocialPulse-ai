/**
 * src/components/dashboard/QuickInsights.tsx
 * IBM Granite AI — 3 quick insights cards + a CTA to the assistant.
 * Rendered from static mock copy (real endpoint is /assistant/chat).
 */
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Lightbulb, AlertTriangle, Rocket } from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/motion';
import { useUser } from '@/store';

interface Insight {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  tag: string;
  tagColor: string;
}

const INSIGHTS: Insight[] = [
  {
    icon: Rocket,
    iconColor: 'text-accent-green',
    iconBg: 'bg-accent-green/10',
    title: 'Best time to post this week',
    body: 'Your audience is most active Tuesday 10–11 AM and Thursday 7–9 PM. Scheduling your next campaign post during these windows could yield a 3× engagement lift.',
    tag: 'Engagement',
    tagColor: 'text-accent-green',
  },
  {
    icon: AlertTriangle,
    iconColor: 'text-accent-orange',
    iconBg: 'bg-accent-orange/10',
    title: 'Sentiment dip on X detected',
    body: "Watson NLP flagged a 12% drop in positive sentiment over the last 6 hours, primarily from replies to your Monday thread. Consider a clarifying follow-up post.",
    tag: 'Sentiment',
    tagColor: 'text-accent-orange',
  },
  {
    icon: Lightbulb,
    iconColor: 'text-accent-indigo',
    iconBg: 'bg-accent-indigo/10',
    title: '#AIContent trend accelerating',
    body: 'Volume up 34% this week with 89% confidence it peaks Tuesday. Publishing an AI-focused post now places you ahead of the wave — estimated +40K incremental reach.',
    tag: 'Trend',
    tagColor: 'text-accent-indigo',
  },
];

export function QuickInsights() {
  const user = useUser();

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white">IBM Granite Insights</h3>
            <p className="text-[10px] text-text-muted">Powered by IBM Granite 13B · Watson NLP</p>
          </div>
        </div>
        <Link
          href="/assistant"
          className="flex items-center gap-1 text-xs text-accent-indigo hover:underline"
        >
          Open assistant <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Personalised greeting */}
      {user && (
        <p className="text-xs text-text-secondary mb-4 pb-4 border-b border-base-border">
          Good {getGreeting()},{' '}
          <span className="font-semibold text-text-primary">{user.name.split(' ')[0]}</span>.
          Here are your top 3 AI-generated insights for today.
        </p>
      )}

      {/* Insights */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {INSIGHTS.map((ins) => {
          const Icon = ins.icon;
          return (
            <motion.div
              key={ins.title}
              variants={itemVariants}
              className="flex gap-3 p-3 rounded-xl bg-base hover:bg-base-surface transition-colors border border-base-border hover:border-brand-indigo/30 cursor-default"
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${ins.iconBg}`}>
                <Icon className={`w-4 h-4 ${ins.iconColor}`} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-text-primary leading-snug">{ins.title}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wide flex-shrink-0 ${ins.tagColor}`}>
                    {ins.tag}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">{ins.body}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
