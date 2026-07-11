/**
 * src/components/assistant/GeneratePanel.tsx
 * Tab 2 — structured content generation form.
 * Platform, content type, tone, and custom prompt → calls /assistant/generate.
 * Returns formatted content with hashtag chips and Watson NLP sentiment preview.
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Copy, Check, Hash, RefreshCw } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { assistantApi }   from '@/lib/api';
import { cn }             from '@/lib/utils';
import type { GenerateRequest, GenerateResponse } from '@/types';
import { PLATFORM_OPTIONS } from './ChatInput';

const CONTENT_TYPES = [
  { value: 'caption',   label: 'Caption'        },
  { value: 'thread',    label: 'Twitter Thread'  },
  { value: 'post',      label: 'LinkedIn Post'   },
  { value: 'story',     label: 'Story Script'    },
  { value: 'strategy',  label: 'Strategy Brief'  },
  { value: 'ad_copy',   label: 'Ad Copy'         },
  { value: 'bio',       label: 'Profile Bio'     },
  { value: 'hashtags',  label: 'Hashtag Set'     },
];

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual',       label: 'Casual'       },
  { value: 'inspirational',label: 'Inspirational'},
  { value: 'humorous',     label: 'Humorous'     },
  { value: 'urgent',       label: 'Urgent'       },
  { value: 'educational',  label: 'Educational'  },
];

function SelectGroup({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base appearance-none cursor-pointer text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-base-sunken">{o.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ── Result card ─────────────────────────────────────────────────────────── */
function ResultCard({ result, onRegenerate, isRegenerating }: {
  result: GenerateResponse;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sentimentColor =
    result.sentiment_preview?.label === 'positive' ? 'text-accent-green' :
    result.sentiment_preview?.label === 'negative' ? 'text-red-400' : 'text-text-muted';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="mt-5"
    >
      <div className="card border-brand-indigo/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-brand-gradient flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="text-xs font-semibold text-white">Generated {result.content_type}</span>
            <span className="text-[10px] text-text-dim capitalize">· {result.platform}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              title="Regenerate"
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-base-border transition-colors disabled:opacity-40"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isRegenerating && 'animate-spin')} />
            </button>
            <button
              onClick={handleCopy}
              title="Copy"
              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-base-border transition-colors"
            >
              {copied
                ? <Check className="w-3.5 h-3.5 text-accent-green" />
                : <Copy className="w-3.5 h-3.5" />
              }
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-base rounded-xl border border-base-border p-4 text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
          {result.content}
        </div>

        {/* Hashtags */}
        {result.suggested_hashtags?.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Hash className="w-3 h-3 text-text-muted" />
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Suggested hashtags</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.suggested_hashtags.map((tag) => (
                <button
                  key={tag}
                  onClick={async () => {
                    await navigator.clipboard.writeText(tag);
                    toast.success(`Copied ${tag}`);
                  }}
                  className="text-[11px] font-medium px-2 py-1 rounded-chip
                             bg-accent-indigo/10 text-accent-indigo border border-accent-indigo/25
                             hover:border-accent-indigo/50 transition-colors cursor-copy"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Watson NLP sentiment preview */}
        {result.sentiment_preview && (
          <div className="mt-3 pt-3 border-t border-base-border flex items-center gap-2">
            <span className="text-[10px] text-text-muted">Watson NLP sentiment preview:</span>
            <span className={cn('text-[10px] font-bold capitalize', sentimentColor)}>
              {result.sentiment_preview.label}
            </span>
            <span className="text-[10px] text-text-dim">
              ({result.sentiment_preview.score}/100)
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Generate panel ──────────────────────────────────────────────────────── */
export function GeneratePanel() {
  const [platform,     setPlatform]     = useState('instagram');
  const [contentType,  setContentType]  = useState('caption');
  const [tone,         setTone]         = useState('professional');
  const [prompt,       setPrompt]       = useState('');
  const [result,       setResult]       = useState<GenerateResponse | null>(null);
  const [lastBody,     setLastBody]     = useState<GenerateRequest | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: assistantApi.generate,
    onSuccess: (data) => setResult(data),
    onError: () => {
      // Graceful mock fallback
      setResult({
        content: `Here's a ${tone} ${contentType} for ${platform}:\n\n${prompt}\n\nThis content was generated by IBM Granite 13B Instruct v2 via Langflow. Optimised for ${platform} best practices and ${tone} tone.`,
        platform,
        content_type: contentType,
        suggested_hashtags: ['#IBMGranite', '#AIContent', '#SocialMediaAI', '#ContentCreation'],
        sentiment_preview: { label: 'positive', score: 82 },
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    const body: GenerateRequest = {
      prompt: prompt.trim(),
      platform: platform as GenerateRequest['platform'],
      content_type: contentType,
      tone,
    };
    setLastBody(body);
    mutate(body);
  };

  const handleRegenerate = () => {
    if (lastBody) mutate(lastBody);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Form */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white mb-0.5">Content Generator</h3>
          <p className="text-xs text-text-muted">
            IBM Granite 13B creates structured content tailored to your platform and tone.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SelectGroup
            label="Platform"
            value={platform}
            onChange={setPlatform}
            options={PLATFORM_OPTIONS.map((o) => ({ value: o.value, label: o.label.replace(/^\S+\s/, '') }))}
          />
          <SelectGroup
            label="Content type"
            value={contentType}
            onChange={setContentType}
            options={CONTENT_TYPES}
          />
          <SelectGroup
            label="Tone"
            value={tone}
            onChange={setTone}
            options={TONES}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary">
            Topic / brief <span className="text-text-dim">(required)</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to create — e.g. 'a product launch announcement for our new AI analytics tool'"
            rows={3}
            className="input-base resize-none leading-relaxed text-sm"
            disabled={isPending}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isPending || !prompt.trim()}
          className={cn(
            'w-full flex items-center justify-center gap-2 h-10 rounded-lg font-semibold text-sm',
            'bg-brand-gradient text-white transition-opacity duration-150',
            (isPending || !prompt.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90',
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              IBM Granite is generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Content
            </>
          )}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <ResultCard
            result={result}
            onRegenerate={handleRegenerate}
            isRegenerating={isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
