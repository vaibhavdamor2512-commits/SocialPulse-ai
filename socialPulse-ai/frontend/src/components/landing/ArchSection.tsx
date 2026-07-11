/**
 * src/components/landing/ArchSection.tsx
 * System architecture diagram — rendered as a visual SVG-like layout using
 * pure HTML/CSS boxes and arrows (no external image dependencies).
 */
'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Monitor, Server, Database, Cpu, GitBranch, MessageSquare, Globe } from 'lucide-react';
import { containerVariants, itemVariants } from '@/lib/motion';

interface ArchNode {
  icon: React.ElementType;
  label: string;
  sub: string;
  color: string;
  bg: string;
  border: string;
}

const LAYERS: { title: string; nodes: ArchNode[] }[] = [
  {
    title: 'Client Layer',
    nodes: [
      {
        icon: Monitor,
        label: 'Next.js 14 Frontend',
        sub: 'TypeScript · Tailwind · Framer Motion',
        color: 'text-accent-sky',
        bg: 'bg-accent-sky/10',
        border: 'border-accent-sky/25',
      },
    ],
  },
  {
    title: 'API Layer',
    nodes: [
      {
        icon: Server,
        label: 'FastAPI Backend',
        sub: 'Python 3.11 · Async · JWT Auth',
        color: 'text-accent-indigo',
        bg: 'bg-accent-indigo/10',
        border: 'border-accent-indigo/25',
      },
    ],
  },
  {
    title: 'IBM AI Services',
    nodes: [
      {
        icon: Cpu,
        label: 'IBM Granite 13B',
        sub: 'Instruct v2 · LLM',
        color: 'text-accent-purple',
        bg: 'bg-accent-purple/10',
        border: 'border-accent-purple/25',
      },
      {
        icon: GitBranch,
        label: 'IBM Langflow',
        sub: 'RAG Pipeline · 7 nodes',
        color: 'text-accent-pink',
        bg: 'bg-accent-pink/10',
        border: 'border-accent-pink/25',
      },
      {
        icon: MessageSquare,
        label: 'Watson NLP',
        sub: 'Sentiment · NER · Tone',
        color: 'text-accent-green',
        bg: 'bg-accent-green/10',
        border: 'border-accent-green/25',
      },
    ],
  },
  {
    title: 'Data Layer',
    nodes: [
      {
        icon: Database,
        label: 'MongoDB',
        sub: 'Collections · Indexes',
        color: 'text-accent-green',
        bg: 'bg-accent-green/10',
        border: 'border-accent-green/25',
      },
      {
        icon: Globe,
        label: 'Redis',
        sub: 'Cache · Session · Queue',
        color: 'text-accent-orange',
        bg: 'bg-accent-orange/10',
        border: 'border-accent-orange/25',
      },
    ],
  },
];

function Arrow() {
  return (
    <div className="flex justify-center my-1">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-base-border">
        <path d="M12 4v14M6 14l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function ArchSection() {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="architecture" className="py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-brand-indigo uppercase tracking-widest mb-3">
            System design
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Production-Ready <span className="text-gradient">Architecture</span>
          </h2>
          <p className="max-w-xl mx-auto text-text-secondary text-base leading-relaxed">
            A fully containerised, horizontally scalable stack — Next.js frontend,
            FastAPI backend, Celery workers, and the complete IBM AI suite.
          </p>
        </motion.div>

        {/* Layer diagram */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="space-y-0"
        >
          {LAYERS.map((layer, li) => (
            <motion.div key={layer.title} variants={itemVariants}>
              {li > 0 && <Arrow />}
              <div className="bg-base-surface/60 border border-base-border rounded-card p-5">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">
                  {layer.title}
                </p>
                <div className={`flex flex-wrap gap-3 ${layer.nodes.length === 1 ? 'justify-center' : ''}`}>
                  {layer.nodes.map((node) => {
                    const Icon = node.icon;
                    return (
                      <div
                        key={node.label}
                        className={`flex items-center gap-3 flex-1 min-w-[180px] rounded-xl border ${node.border} ${node.bg} px-4 py-3`}
                      >
                        <span className={`w-9 h-9 rounded-lg border ${node.border} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4.5 h-4.5 ${node.color}`} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-text-primary leading-snug">{node.label}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{node.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Docker badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-text-muted mt-8"
        >
          All services orchestrated via{' '}
          <span className="text-accent-sky font-medium">Docker Compose</span> with an{' '}
          <span className="text-accent-indigo font-medium">Nginx</span> reverse proxy.
          Celery handles async background tasks.
        </motion.p>
      </div>
    </section>
  );
}
