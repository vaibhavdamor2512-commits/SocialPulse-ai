/**
 * src/components/landing/TestimonialsSection.tsx
 * Three testimonial cards with avatar initials, name, role, and quote.
 */
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/motion';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  color: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'SocialPulse AI surfaced a trending topic 48 hours before it went viral. We published first, got 400K impressions, and tripled our follower growth that week.',
    name: 'Sarah Chen',
    role: 'Head of Social',
    company: 'Momentum Brands',
    initials: 'SC',
    color: 'bg-accent-indigo/20 text-accent-indigo',
  },
  {
    quote:
      'The Watson NLP sentiment layer is genuinely impressive — it caught a PR issue brewing in our comment sections a full day before our manual moderation team did.',
    name: 'James Okafor',
    role: 'Digital Marketing Director',
    company: 'Apex Retail Group',
    initials: 'JO',
    color: 'bg-accent-purple/20 text-accent-purple',
  },
  {
    quote:
      'Being able to ask the AI "why did our engagement drop Tuesday?" and get a structured, cited answer is a game-changer. It replaced three separate analytics tools.',
    name: 'Priya Nair',
    role: 'Growth Lead',
    company: 'Launchpad Ventures',
    initials: 'PN',
    color: 'bg-accent-green/20 text-accent-green',
  },
];

export function TestimonialsSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-brand-indigo uppercase tracking-widest mb-3">
            Customer stories
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Trusted by teams that <span className="text-gradient">move fast</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={itemVariants}
              className="bg-base-surface border border-base-border rounded-card p-6 flex flex-col"
            >
              <Quote className="w-6 h-6 text-brand-indigo/50 mb-4 flex-shrink-0" />
              <p className="text-sm text-text-secondary leading-relaxed flex-1 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-base-border">
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${t.color}`}
                >
                  {t.initials}
                </span>
                <div>
                  <p className="text-xs font-semibold text-text-primary">{t.name}</p>
                  <p className="text-[10px] text-text-muted">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
