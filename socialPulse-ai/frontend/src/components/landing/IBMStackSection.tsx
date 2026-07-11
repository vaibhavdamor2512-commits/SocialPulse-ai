/**
 * src/components/landing/IBMStackSection.tsx
 * Showcases the three IBM AI services used: Granite, Langflow, Watson NLP.
 */
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Cpu, GitBranch, MessageSquare, ArrowRight } from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/motion';

interface StackCard {
  icon: React.ElementType;
  product: string;
  subtitle: string;
  description: string;
  capabilities: string[];
  color: string;
  bg: string;
  border: string;
}

const STACK: StackCard[] = [
  {
    icon: Cpu,
    product: 'IBM Granite 13B Instruct v2',
    subtitle: 'Foundation Language Model',
    description:
      "IBM's enterprise-grade open-source LLM powers every generative AI feature — from campaign strategy to content generation and competitor SWOT synthesis.",
    capabilities: [
      'AI Assistant chat (RAG)',
      'Campaign strategy generation',
      'Competitor SWOT synthesis',
      'Content angle ideation',
      'Influencer collaboration scoring',
    ],
    color: 'text-accent-indigo',
    bg: 'bg-accent-indigo/8',
    border: 'border-accent-indigo/25',
  },
  {
    icon: GitBranch,
    product: 'IBM Langflow',
    subtitle: 'Visual AI Pipeline Orchestration',
    description:
      'A 7-node Langflow workflow connects Granite to a Retrieval-Augmented Generation pipeline — with a Redis memory store, prompt templates, and structured output parsers.',
    capabilities: [
      '7-node orchestration pipeline',
      'Redis conversation memory',
      'Multi-step reasoning chains',
      'Structured JSON output parsing',
      'Platform data injection',
    ],
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/8',
    border: 'border-accent-purple/25',
  },
  {
    icon: MessageSquare,
    product: 'IBM Watson NLP',
    subtitle: 'Natural Language Processing',
    description:
      'Watson NLP enriches every post and mention with multi-label sentiment classification, keyword extraction, entity recognition, and tone analysis at scale.',
    capabilities: [
      'Multi-label sentiment (5-class)',
      'Keyword & entity extraction',
      'Tone & emotion detection',
      '94%+ classification accuracy',
      'Batch processing pipeline',
    ],
    color: 'text-accent-sky',
    bg: 'bg-accent-sky/8',
    border: 'border-accent-sky/25',
  },
];

export function IBMStackSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="ibm-stack" className="py-24 sm:py-32 bg-base-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-brand-purple uppercase tracking-widest mb-3">
            Built exclusively on
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            The <span className="text-gradient">IBM AI Stack</span>
          </h2>
          <p className="max-w-xl mx-auto text-text-secondary text-base leading-relaxed">
            No third-party AI providers. Every intelligent feature runs on IBM's enterprise
            AI portfolio — Granite, Langflow, and Watson NLP.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-3 gap-6"
        >
          {STACK.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.product}
                variants={itemVariants}
                className={`rounded-card border ${card.border} ${card.bg} p-6 flex flex-col`}
              >
                <span className={`inline-flex w-12 h-12 rounded-xl border ${card.border} items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </span>

                <p className={`text-xs font-semibold ${card.color} uppercase tracking-widest mb-1`}>
                  {card.subtitle}
                </p>
                <h3 className="text-base font-bold text-text-primary mb-3 leading-snug">
                  {card.product}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-5">
                  {card.description}
                </p>

                <ul className="space-y-2 mt-auto">
                  {card.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2 text-xs text-text-secondary">
                      <ArrowRight className={`w-3 h-3 flex-shrink-0 ${card.color}`} />
                      {cap}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
