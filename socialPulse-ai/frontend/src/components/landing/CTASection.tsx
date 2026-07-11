/**
 * src/components/landing/CTASection.tsx
 * Full-width gradient CTA band above the footer.
 */
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl border border-brand-indigo/30 bg-base-surface overflow-hidden px-8 sm:px-16 py-16 text-center"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-indigo/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-purple/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-brand-gradient items-center justify-center mb-6 shadow-glow">
              <Zap className="w-7 h-7 text-white" />
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Ready to outpace your{' '}
              <span className="text-gradient">competition?</span>
            </h2>

            <p className="max-w-xl mx-auto text-text-secondary text-base leading-relaxed mb-8">
              Join 500+ brands already using SocialPulse AI to predict trends,
              decode competitors, and generate IBM-powered strategy — in minutes,
              not months.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/login">
                <Button
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Free — 14 Days No Risk
                </Button>
              </Link>
              <a href="#pricing">
                <Button variant="ghost" size="lg">
                  View Pricing
                </Button>
              </a>
            </div>

            <p className="mt-5 text-xs text-text-muted">
              No credit card required · Cancel any time · SOC 2 compliant
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
