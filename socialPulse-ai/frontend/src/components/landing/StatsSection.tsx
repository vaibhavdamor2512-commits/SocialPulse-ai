/**
 * src/components/landing/StatsSection.tsx
 * Animated counter row: 4 key platform statistics.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  description: string;
}

const STATS: Stat[] = [
  { value: 10,   suffix: 'M+',  label: 'Posts Analysed',       description: 'Across all platforms daily' },
  { value: 98.7, suffix: '%',   label: 'Sentiment Accuracy',   description: 'IBM Watson NLP powered'      },
  { value: 3.2,  suffix: 'x',   label: 'Engagement Lift',      description: 'Average across customers'    },
  { value: 500,  suffix: '+',   label: 'Brands Onboarded',     description: 'From startups to enterprise' },
];

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(1)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
}

function StatItem({ stat, started }: { stat: Stat; started: boolean }) {
  const count = useCountUp(stat.value, 1600, started);
  const display =
    stat.value % 1 === 0
      ? Math.round(count).toLocaleString()
      : count.toFixed(1);

  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center text-center px-6 py-8"
    >
      <p className="text-4xl sm:text-5xl font-extrabold text-gradient leading-none mb-1">
        {display}
        {stat.suffix}
      </p>
      <p className="text-base font-semibold text-text-primary mt-2">{stat.label}</p>
      <p className="text-sm text-text-muted mt-1">{stat.description}</p>
    </motion.div>
  );
}

export function StatsSection() {
  const ref      = useRef<HTMLDivElement>(null);
  const inView   = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="border-y border-base-border bg-base-surface/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-base-border"
        >
          {STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} started={inView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
