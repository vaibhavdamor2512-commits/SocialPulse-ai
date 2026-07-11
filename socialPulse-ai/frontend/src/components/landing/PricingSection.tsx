/**
 * src/components/landing/PricingSection.tsx
 * Three-tier pricing cards with feature lists and CTA buttons.
 */
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { containerVariants, itemVariants } from '@/lib/motion';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for solo creators and small social accounts.',
    cta: 'Start Free Trial',
    highlighted: false,
    features: [
      '3 connected social profiles',
      'Analytics dashboard',
      'Watson NLP sentiment analysis',
      '50 AI assistant messages/mo',
      'PDF report exports',
      'Email support',
    ],
  },
  {
    name: 'Growth',
    price: '$99',
    period: '/month',
    description: 'Everything a growing brand needs to dominate their niche.',
    cta: 'Start Free Trial',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      '10 connected social profiles',
      'All Starter features',
      'Trend prediction & virality scoring',
      'Competitor analysis (up to 5)',
      'Influencer mapping & scoring',
      '500 AI assistant messages/mo',
      'Campaign manager',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Full platform access, SLA, SSO, and dedicated AI compute.',
    cta: 'Contact Sales',
    highlighted: false,
    features: [
      'Unlimited social profiles',
      'All Growth features',
      'Dedicated IBM Granite instance',
      'Unlimited AI messages',
      'Unlimited competitors',
      'White-label reports',
      'SSO / SAML',
      '99.9% SLA + dedicated CSM',
    ],
  },
];

export function PricingSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-base-surface/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-brand-pink uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Simple, transparent{' '}
            <span className="text-gradient">pricing</span>
          </h2>
          <p className="max-w-lg mx-auto text-text-secondary text-base leading-relaxed">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6 items-stretch"
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={cn(
                'relative flex flex-col rounded-card border p-7',
                plan.highlighted
                  ? 'border-brand-indigo/60 bg-brand-gradient/5 shadow-glow'
                  : 'border-base-border bg-base-surface',
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold px-3 py-1 rounded-chip bg-brand-gradient text-white">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-base font-bold text-text-primary mb-1">{plan.name}</h3>
                <p className="text-text-muted text-xs mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span
                    className={cn(
                      'text-4xl font-extrabold',
                      plan.highlighted ? 'text-gradient' : 'text-text-primary',
                    )}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-text-muted text-sm mb-1">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-xs text-text-secondary">
                    <Check className="w-3.5 h-3.5 text-accent-green mt-0.5 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link href="/login">
                <Button
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  size="md"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
