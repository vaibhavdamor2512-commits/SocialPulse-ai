/**
 * src/components/landing/FAQSection.tsx
 * Accordion-style FAQ — click to expand/collapse each question.
 */
'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { containerVariants, itemVariants } from '@/lib/motion';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'Does SocialPulse AI use any third-party AI providers?',
    a: "No. Every AI feature runs exclusively on IBM's AI portfolio — IBM Granite 13B Instruct v2 for language generation, IBM Langflow for pipeline orchestration, and IBM Watson NLP for natural language classification. There is zero dependency on OpenAI, Anthropic, or other providers.",
  },
  {
    q: 'Which social platforms are supported?',
    a: 'Instagram, X (Twitter), LinkedIn, and Facebook are fully supported in the current release, with TikTok and YouTube on the roadmap. All four platforms feed into a single unified analytics view.',
  },
  {
    q: 'How accurate is the sentiment analysis?',
    a: 'Watson NLP achieves 94%+ multi-label sentiment accuracy on our benchmark dataset, classifying posts across five classes: strongly positive, positive, neutral, negative, and strongly negative — plus emotion tone (joy, anger, surprise, fear, disgust).',
  },
  {
    q: 'Can I export reports with my own branding?',
    a: 'Yes. Growth and Enterprise plans include white-label PDF, Excel, and CSV exports. You can upload your logo and select brand colours directly from the Settings page.',
  },
  {
    q: 'How does trend prediction work?',
    a: 'Our trend engine applies time-series analysis to hashtag velocity, engagement rate acceleration, and cross-platform mention co-occurrence. IBM Granite then enriches each prediction with a narrative explanation and recommended action.',
  },
  {
    q: 'Is there a self-hosted / on-premise option?',
    a: 'Yes. The entire stack is containerised via Docker Compose and can be deployed to any Kubernetes cluster or on-premise server. IBM AI services can be pointed at your own IBM Cloud or on-premise Watson deployments.',
  },
  {
    q: 'What happens when the IBM AI services are unavailable?',
    a: 'The platform includes intelligent mock fallback in the service layer. If a live IBM endpoint is unreachable, the API falls back to deterministic realistic mock data so the UI remains fully functional — every endpoint, chart, and AI feature continues to work.',
  },
];

function FAQRow({ item, open, onToggle }: { item: FAQItem; open: boolean; onToggle: () => void }) {
  return (
    <motion.div variants={itemVariants} className="border-b border-base-border last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-sm font-semibold text-text-primary group-hover:text-white transition-colors">
          {item.q}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-text-secondary leading-relaxed pr-8">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="faq" className="py-24 sm:py-32 bg-base-surface/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-semibold text-brand-indigo uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="bg-base-surface border border-base-border rounded-card divide-y-0 px-6"
        >
          {FAQS.map((item, i) => (
            <FAQRow
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
