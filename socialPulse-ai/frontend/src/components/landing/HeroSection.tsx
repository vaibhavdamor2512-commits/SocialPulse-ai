/**
 * src/components/landing/HeroSection.tsx
 * Full-viewport hero with animated headline, sub-text, CTAs, and a
 * mock dashboard preview card.
 */
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star, TrendingUp, BarChart3, Bot } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge }  from '@/components/ui/Badge';
import { containerVariants, itemVariants, fadeUpVariants } from '@/lib/motion';

// Floating metric cards shown around the mock dashboard
const FLOAT_CARDS = [
  {
    icon: TrendingUp,
    label: 'Engagement Rate',
    value: '+24.8%',
    sub: 'vs last week',
    color: 'text-accent-green',
    bg: 'bg-accent-green/10',
    pos: 'top-8 -left-4 md:-left-16',
  },
  {
    icon: BarChart3,
    label: 'Impressions',
    value: '2.4M',
    sub: 'this month',
    color: 'text-accent-indigo',
    bg: 'bg-accent-indigo/10',
    pos: 'top-8 -right-4 md:-right-16',
  },
  {
    icon: Bot,
    label: 'AI Insights',
    value: '142',
    sub: 'generated today',
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
    pos: 'bottom-8 -left-4 md:-left-10',
  },
  {
    icon: Star,
    label: 'Sentiment',
    value: '94%',
    sub: 'positive mentions',
    color: 'text-accent-orange',
    bg: 'bg-accent-orange/10',
    pos: 'bottom-8 -right-4 md:-right-10',
  },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background glow blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-indigo/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-pink/5 rounded-full blur-3xl" />
      </div>

      {/* Grid dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #6172f3 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <Badge variant="indigo" className="px-3 py-1 text-xs font-medium">
            🏆 IBM AI Hackathon 2024 — Built on IBM Granite &amp; Watson NLP
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4 mb-6"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08]"
          >
            Social Media Intelligence
            <br />
            <span className="text-gradient">Powered by IBM AI</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-base sm:text-lg text-text-secondary leading-relaxed"
          >
            Unify every platform into one AI-driven workspace. Predict viral trends, decode
            competitor strategy, automate campaigns, and get real-time Watson NLP sentiment
            — all in a single, elegant dashboard.
          </motion.p>
        </motion.div>

        {/* CTA row */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <Link href="/login">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Free — No Credit Card
            </Button>
          </Link>
          <a href="#features">
            <Button variant="ghost" size="lg" leftIcon={<Play className="w-4 h-4" />}>
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Mock dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Floating metric cards */}
          {FLOAT_CARDS.map(({ icon: Icon, label, value, sub, color, bg, pos }) => (
            <div
              key={label}
              className={`absolute z-20 ${pos} hidden sm:flex items-center gap-2.5
                bg-base-surface border border-base-border rounded-xl px-3 py-2.5 shadow-card
                text-left whitespace-nowrap`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </span>
              <div>
                <p className={`text-sm font-bold leading-none ${color}`}>{value}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{label}</p>
                <p className="text-[10px] text-text-muted">{sub}</p>
              </div>
            </div>
          ))}

          {/* Dashboard frame */}
          <div className="relative rounded-2xl border border-base-border bg-base-surface overflow-hidden shadow-card">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-base-sunken border-b border-base-border">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="flex-1 mx-3 h-6 rounded-md bg-base-border/50 flex items-center px-3">
                <span className="text-xs text-text-muted">app.socialpulse.ai/dashboard</span>
              </span>
            </div>

            {/* Dashboard mock body */}
            <div className="p-5 space-y-4">
              {/* Top stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Reach',     value: '8.2M',   change: '+12%', color: 'text-accent-indigo' },
                  { label: 'Engagements',     value: '342K',   change: '+8%',  color: 'text-accent-purple' },
                  { label: 'Followers',       value: '156K',   change: '+5%',  color: 'text-accent-green'  },
                  { label: 'Brand Score',     value: '92/100', change: '+3pt', color: 'text-accent-orange' },
                ].map((s) => (
                  <div key={s.label} className="bg-base rounded-xl p-3 border border-base-border">
                    <p className="text-[10px] text-text-muted mb-1">{s.label}</p>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-accent-green mt-0.5">{s.change}</p>
                  </div>
                ))}
              </div>

              {/* Chart placeholder */}
              <div className="h-36 bg-base rounded-xl border border-base-border flex items-end px-4 pb-4 gap-1.5 overflow-hidden">
                {[40, 60, 45, 75, 55, 80, 65, 90, 70, 85, 72, 95, 80, 100, 88, 76, 92].map(
                  (h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        background:
                          i % 3 === 0
                            ? 'linear-gradient(180deg,#6172f3,#a855f7)'
                            : i % 3 === 1
                            ? 'rgba(97,114,243,0.3)'
                            : 'rgba(168,85,247,0.2)',
                      }}
                    />
                  )
                )}
              </div>

              {/* Bottom row: sentiment + AI chat preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sentiment */}
                <div className="bg-base rounded-xl p-3 border border-base-border">
                  <p className="text-[10px] text-text-muted mb-2">Sentiment Breakdown</p>
                  <div className="flex items-center gap-1 h-4 rounded-full overflow-hidden">
                    <div className="h-full rounded-l-full bg-accent-green/80"  style={{ width: '62%' }} />
                    <div className="h-full bg-text-dim/50"                      style={{ width: '24%' }} />
                    <div className="h-full rounded-r-full bg-red-400/60"       style={{ width: '14%' }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-accent-green">62% Positive</span>
                    <span className="text-[9px] text-text-muted">24% Neutral</span>
                    <span className="text-[9px] text-red-400">14% Negative</span>
                  </div>
                </div>

                {/* AI chat snippet */}
                <div className="bg-base rounded-xl p-3 border border-base-border space-y-2">
                  <p className="text-[10px] text-text-muted mb-1">AI Assistant</p>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-gradient flex-shrink-0 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-white" />
                    </span>
                    <p className="text-[10px] text-text-secondary leading-relaxed">
                      Your Saturday posts get 3× more engagement. Schedule your next campaign for 10 AM.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <p className="text-[10px] text-text-muted bg-base-border/40 rounded px-2 py-1">
                      Why does it peak on weekends?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-base to-transparent pointer-events-none rounded-b-2xl" />
        </motion.div>

        {/* Social proof logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 flex flex-col items-center gap-4"
        >
          <p className="text-xs text-text-muted uppercase tracking-widest">
            Trusted by social teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-40">
            {['Acme Corp', 'Globex', 'Initech', 'Umbrella Co', 'Hooli'].map((name) => (
              <span key={name} className="text-sm font-semibold text-text-secondary">
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
