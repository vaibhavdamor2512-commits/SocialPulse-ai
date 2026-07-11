/**
 * src/components/landing/FeaturesSection.tsx
 * 8-feature grid with icon, title, description — staggered reveal on scroll.
 */
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BarChart3, Bot, TrendingUp, Target, Star, FileText, Bell, Rocket,
} from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/motion';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bg: string;
  badge?: string;
}

const FEATURES: Feature[] = [
  {
    icon: BarChart3,
    title: 'Unified Analytics',
    description:
      'Aggregate metrics from Instagram, X, LinkedIn and Facebook into a single real-time dashboard with cross-platform comparison.',
    color: 'text-accent-indigo',
    bg: 'bg-accent-indigo/10',
  },
  {
    icon: Bot,
    title: 'IBM Granite AI Assistant',
    description:
      'Ask anything in natural language. Powered by IBM Granite 13B Instruct v2 via Langflow pipelines — strategy, content, and analysis on demand.',
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
    badge: 'IBM Granite',
  },
  {
    icon: TrendingUp,
    title: 'Viral Trend Prediction',
    description:
      'Time-series forecasting identifies emerging hashtags and topics 48–72 hours before they peak, giving you first-mover advantage.',
    color: 'text-accent-green',
    bg: 'bg-accent-green/10',
  },
  {
    icon: Target,
    title: 'Competitor Intelligence',
    description:
      'Automated SWOT analysis, posting-pattern breakdowns, and AI-generated strategic recommendations against up to 10 competitors.',
    color: 'text-accent-orange',
    bg: 'bg-accent-orange/10',
  },
  {
    icon: Star,
    title: 'Influencer Mapping',
    description:
      'Discover high-ROI micro-influencers through network-graph analysis. Score collaborators on relevance, reach, and brand alignment.',
    color: 'text-accent-pink',
    bg: 'bg-accent-pink/10',
  },
  {
    icon: Rocket,
    title: 'Campaign Manager',
    description:
      'Plan, launch and track multi-platform campaigns. AI generates tailored strategy, content angles, and KPI projections.',
    color: 'text-accent-sky',
    bg: 'bg-accent-sky/10',
  },
  {
    icon: FileText,
    title: 'Automated Reports',
    description:
      'One-click export to PDF, Excel, or CSV. Fully white-labelled with your brand colours and logo, ready to share with stakeholders.',
    color: 'text-accent-indigo',
    bg: 'bg-accent-indigo/10',
  },
  {
    icon: Bell,
    title: 'Real-Time Alerts',
    description:
      'Instant notifications for brand mentions, sentiment spikes, competitor moves, and viral content opportunities — zero lag.',
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
  },
];

export function FeaturesSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
          ref={ref}
        >
          <p className="text-sm font-semibold text-brand-indigo uppercase tracking-widest mb-3">
            Everything you need
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            One platform.{' '}
            <span className="text-gradient">Infinite insight.</span>
          </h2>
          <p className="max-w-xl mx-auto text-text-secondary text-base leading-relaxed">
            From raw data to boardroom-ready strategy — SocialPulse AI handles every layer
            of your social media intelligence stack.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group bg-base-surface border border-base-border rounded-card p-5
                           hover:border-brand-indigo/40 hover:shadow-card-hover transition-all duration-200"
              >
                <span className={`inline-flex w-10 h-10 rounded-xl items-center justify-center mb-4 ${feature.bg}`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </span>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-text-primary text-sm">{feature.title}</h3>
                  {feature.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-chip bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/30">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
